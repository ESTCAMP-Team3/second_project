from flask import Blueprint, request, jsonify
import logging
from datetime import datetime, timedelta
from models.data_fetcher import DataFetcher
from models.stock_cluster_prediction_model import StockClusterPredictionModel
from utils.validators import validate_stock_symbol, validate_prediction_request

# Blueprint 생성
cluster_predict_bp = Blueprint('cluster_predict', __name__)

# 전역 객체 초기화
data_fetcher = DataFetcher()
prediction_model = StockClusterPredictionModel()

# 로거 설정
logger = logging.getLogger(__name__)

# 간단한 메모리 캐시 (실제 운영에서는 Redis 등 사용)
prediction_cache = {}


@cluster_predict_bp.route('/<symbol>', methods=['POST'])
def predict_stock(symbol):
    """
    주식 진입점 예측 API

    URL Parameters:
        symbol (str): 주식 심볼 (예: AAPL, GOOGL, MSFT, TSLA)

    Request Body (JSON) - 선택사항:
        {
            "period": str,    # 학습 데이터 기간 (기본값: "5y")
            "retrain": bool   # 모델 재학습 여부 (기본값: false)
        }

    Returns:
        JSON: 진입점 추천 결과
        {
            "success": bool,
            "symbol": str,
            "signal": str,        # "매수", "매도", "관망"
            "confidence": float,  # 신뢰도 (0.0 ~ 1.0)
            "expected_return": float,  # 예상 수익률 (%)
            "timestamp": str
        }
    """
    try:
        # 1. 입력 데이터 파싱
        request_data = request.get_json() or {}
        period = request_data.get('period', '5y')
        retrain = request_data.get('retrain', False)

        # 2. 입력 검증
        try:
            validate_stock_symbol(symbol.upper())
        except ValueError as ve:
            logger.warning(f"입력 검증 실패 - Symbol: {symbol}, Error: {str(ve)}")
            return jsonify({
                'success': False,
                'error': 'VALIDATION_ERROR',
                'message': str(ve)
            }), 400

        symbol = symbol.upper()

        # 3. 캐시 확인
        cache_key = f"prediction_{symbol}_{period}_{retrain}"
        if not retrain and cache_key in prediction_cache:
            cached_result = prediction_cache[cache_key]
            # 캐시가 30분 이내라면 반환
            cache_time = datetime.fromisoformat(cached_result['timestamp'])
            if datetime.now() - cache_time < timedelta(minutes=30):
                logger.info(f"[{symbol}] 캐시된 예측 결과 반환")
                return jsonify(cached_result), 200

        # 4. 모델 학습 필요 여부 확인
        needs_training = (
                retrain or
                symbol not in prediction_model.models or
                prediction_model.get_model_info(symbol) is None
        )

        if needs_training:
            logger.info(f"[{symbol}] 모델 학습 시작")

            # 학습 데이터 가져오기
            try:
                end_date = datetime.now()
                period_days = {'4y': 1460, '5y': 1825}

                if period not in period_days:
                    raise ValueError(f"지원하지 않는 기간: {period}")

                start_date = end_date - timedelta(days=period_days[period])

                stock_data = data_fetcher.fetch_stock_data(
                    symbol=symbol,
                    start_date=start_date.strftime('%Y-%m-%d'),
                    end_date=end_date.strftime('%Y-%m-%d')
                )

                if stock_data is None or stock_data.empty:
                    return jsonify({
                        'success': False,
                        'error': 'DATA_FETCH_ERROR',
                        'message': f'주식 데이터를 가져올 수 없습니다: {symbol}'
                    }), 404

                # 모델 학습
                prediction_model.train_model(symbol, stock_data, force_retrain=retrain)
                logger.info(f"[{symbol}] 모델 학습 완료")

            except Exception as e:
                logger.error(f"[{symbol}] 모델 학습 실패: {str(e)}")
                return jsonify({
                    'success': False,
                    'error': 'MODEL_TRAINING_ERROR',
                    'message': f'모델 학습 실패: {str(e)}'
                }), 500

        # 5. 예측 실행
        try:
            # 당일 예측만 수행 (진입점 판단용)
            predictions = prediction_model.predict(symbol, days=1)

            if predictions.empty:
                return jsonify({
                    'success': False,
                    'error': 'PREDICTION_ERROR',
                    'message': '예측 결과를 생성할 수 없습니다'
                }), 500

            # 첫 번째 (당일) 예측 결과 추출
            first_prediction = predictions.iloc[0]

            # 응답 데이터 구성
            response_data = {
                'success': True,
                'symbol': symbol,
                'signal': str(first_prediction['시그널']),
                'confidence': round(float(first_prediction['신뢰도']), 3),
                'expected_return': round(float(first_prediction['예상수익률']), 2),
                'timestamp': datetime.now().isoformat()
            }

            # 캐시 저장
            prediction_cache[cache_key] = response_data

            logger.info(f"[{symbol}] 예측 완료 - 시그널: {response_data['signal']}, 신뢰도: {response_data['confidence']}")

            return jsonify(response_data), 200

        except Exception as e:
            logger.error(f"[{symbol}] 예측 실행 실패: {str(e)}")
            return jsonify({
                'success': False,
                'error': 'PREDICTION_ERROR',
                'message': f'예측 실행 실패: {str(e)}'
            }), 500

    except Exception as e:
        logger.error(f"[{symbol}] 예상치 못한 오류: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'INTERNAL_SERVER_ERROR',
            'message': '서버 내부 오류가 발생했습니다'
        }), 500