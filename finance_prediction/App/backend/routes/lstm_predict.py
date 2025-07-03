from flask import Blueprint, request, jsonify, current_app
from models.data_fetcher import DataFetcher
from models.stock_lstm_prediction_model import StockLSTMPredictionModel
from utils.validators import validate_prediction_request, validate_stock_symbol
from datetime import timedelta, datetime
import logging
import hashlib
import json

# Blueprint 생성
lstm_predict_bp = Blueprint('lstm_predict', __name__)

# 전역 객체 초기화
data_fetcher = DataFetcher()
prediction_model = StockLSTMPredictionModel()

# 로거 설정
logger = logging.getLogger(__name__)

# 간단한 메모리 캐시 (실제 운영에서는 Redis 등 사용)
prediction_cache = {}


@lstm_predict_bp.route('/<symbol>', methods=['POST'])
def predict_stock(symbol):
    """
    특정 주식 심볼에 대한 LSTM 예측 수행

    URL Parameters:
        symbol (str): 주식 심볼 (예: AAPL, GOOGL, MSFT)

    Request Body (JSON):
        {
            "days": int,           # 예측할 일수 (기본값: 5, 최대: 30)
            "period": str,         # 학습 데이터 기간 (기본값: "1y", 옵션: "6mo", "1y", "2y")
            "retrain": bool        # 모델 재학습 여부 (기본값: false)
        }

    Returns:
        JSON: 예측 결과 또는 에러 메시지
        {
            "success": bool,
            "symbol": str,
            "predictions": [
                {
                    "날짜": "2025-07-03",
                    "예측가격": 150.25
                }
            ],
            "model_info": {
                "model_type": "lstm",
                "training_period": str,
                "training_data_points": int,
                "prediction_days": int,
                "top_features": list,
                "window_size": int,
                "lstm_units": int,
                "dropout_rate": float
            }
        }
    """

    try:
        # 1. 입력 데이터 파싱 및 기본값 설정
        request_data = request.get_json() or {}

        days = request_data.get('days', 5)  # 예측할 일수
        period = request_data.get('period', '1y')  # 학습 데이터 기간
        retrain = request_data.get('retrain', False)  # 재학습 여부

        # 2. 입력 값 검증
        try:
            # 주식 심볼 검증
            validate_stock_symbol(symbol.upper())

            # 예측 요청 파라미터 검증
            validate_prediction_request({
                'days': days,
                'period': period,
                'retrain': retrain
            })

        except ValueError as ve:
            logger.warning(f"입력 검증 실패 - Symbol: {symbol}, Error: {str(ve)}")
            return jsonify({
                'success': False,
                'error': 'VALIDATION_ERROR',
                'message': str(ve)
            }), 400

        # 심볼을 대문자로 정규화
        symbol = symbol.upper()

        # 3. 캐시 키 생성
        cache_key = f"{symbol}_{days}_{period}_{retrain}"
        
        # 4. 캐시 확인 (재학습이 요청되지 않은 경우에만)
        if not retrain and cache_key in prediction_cache:
            logger.info(f"[{symbol}] 캐시된 예측 결과 반환")
            return jsonify(prediction_cache[cache_key]), 200

        # 5. 모델 재학습이 필요한지 확인
        needs_training = (
                retrain or
                symbol not in prediction_model.models or
                prediction_model.get_model_info(symbol) is None
        )

        stock_data = None
        if needs_training:
            logger.info(f"[{symbol}] LSTM 모델 학습 시작 - Period: {period}")

            # 6. 학습 데이터 가져오기
            try:
                # 현재 날짜 기준으로 과거 데이터 조회
                end_date = datetime.now()

                # 기간별 시작 날짜 계산
                period_days = {
                    '6mo': 180,
                    '1y': 365,
                    '2y': 730,
                    '5y': 1825
                }

                if period not in period_days:
                    raise ValueError(f"지원하지 않는 기간입니다: {period}")

                start_date = end_date - timedelta(days=period_days[period])

                # 주식 데이터 가져오기
                stock_data = data_fetcher.fetch_stock_data(
                    symbol=symbol,
                    start_date=start_date.strftime('%Y-%m-%d'),
                    end_date=end_date.strftime('%Y-%m-%d')
                )

                if stock_data is None or stock_data.empty:
                    logger.error(f"[{symbol}] 주식 데이터를 가져올 수 없습니다.")
                    return jsonify({
                        'success': False,
                        'error': 'DATA_FETCH_ERROR',
                        'message': f'주식 데이터를 가져올 수 없습니다: {symbol}'
                    }), 404

                logger.info(f"[{symbol}] 데이터 수집 완료 - {len(stock_data)}개 데이터 포인트")

            except Exception as e:
                logger.error(f"[{symbol}] 데이터 가져오기 실패: {str(e)}")
                return jsonify({
                    'success': False,
                    'error': 'DATA_FETCH_ERROR',
                    'message': f'데이터 가져오기 실패: {str(e)}'
                }), 500

            # 7. 모델 학습
            try:
                prediction_model.train_model(symbol, stock_data, force_retrain=retrain)
                logger.info(f"[{symbol}] LSTM 모델 학습 완료")

            except Exception as e:
                logger.error(f"[{symbol}] LSTM 모델 학습 실패: {str(e)}")
                return jsonify({
                    'success': False,
                    'error': 'MODEL_TRAINING_ERROR',
                    'message': f'LSTM 모델 학습 실패: {str(e)}'
                }), 500

        # 8. 예측 수행
        try:
            logger.info(f"[{symbol}] LSTM {days}일 예측 시작")

            # 예측 실행
            predictions = prediction_model.predict(symbol, days=days)

            # 모델 정보 가져오기
            model_info = prediction_model.get_model_info(symbol)

            # 예측 결과를 JSON 직렬화 가능한 형태로 변환
            predictions_list = []
            for _, row in predictions.iterrows():
                predictions_list.append({
                    '날짜': row['날짜'].strftime('%Y-%m-%d') if hasattr(row['날짜'], 'strftime') else str(row['날짜']),
                    '예측가격': round(float(row['예측가격']), 2)
                })

            logger.info(f"[{symbol}] LSTM 예측 완료 - {len(predictions_list)}개 결과")

            # 9. 성공 응답 반환
            response_data = {
                'success': True,
                'symbol': symbol,
                'predictions': predictions_list,
                'model_info': {
                    'model_type': 'lstm',
                    'training_period': period,
                    'training_data_points': len(stock_data) if stock_data is not None else 0,
                    'prediction_days': days,
                    'top_features': model_info['top_features'] if model_info else [],
                    'window_size': model_info['window_size'] if model_info else 0,
                    'lstm_units': model_info['lstm_units'] if model_info else 0,
                    'dropout_rate': model_info['dropout_rate'] if model_info else 0
                },
                'timestamp': datetime.now().isoformat()
            }

            # 10. 캐시에 저장
            prediction_cache[cache_key] = response_data
            
            return jsonify(response_data), 200

        except Exception as e:
            logger.error(f"[{symbol}] LSTM 예측 실행 실패: {str(e)}")
            return jsonify({
                'success': False,
                'error': 'PREDICTION_ERROR',
                'message': f'LSTM 예측 실행 실패: {str(e)}'
            }), 500

    except Exception as e:
        # 예상치 못한 오류 처리
        logger.error(f"[{symbol}] 예상치 못한 오류: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'INTERNAL_SERVER_ERROR',
            'message': '서버 내부 오류가 발생했습니다.'
        }), 500