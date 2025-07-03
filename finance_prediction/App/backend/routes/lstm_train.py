from flask import Blueprint, request, jsonify, current_app
from models.data_fetcher import DataFetcher
from models.stock_lstm_prediction_model import StockLSTMPredictionModel
from utils.validators import validate_stock_symbol
from datetime import timedelta, datetime
import logging

# Blueprint 생성
lstm_train_bp = Blueprint('lstm_train', __name__)

# 전역 객체 초기화
data_fetcher = DataFetcher()
prediction_model = StockLSTMPredictionModel()

# 로거 설정
logger = logging.getLogger(__name__)


@lstm_train_bp.route('/<symbol>', methods=['POST'])
def train_model(symbol):
    """
    특정 주식 심볼에 대한 LSTM 모델 학습

    URL Parameters:
        symbol (str): 주식 심볼 (예: AAPL, GOOGL, MSFT)

    Request Body (JSON):
        {
            "period": str,         # 학습 데이터 기간 (기본값: "1y", 옵션: "6mo", "1y", "2y", "5y")
            "force_retrain": bool  # 강제 재학습 여부 (기본값: false)
        }

    Returns:
        JSON: 학습 결과 또는 에러 메시지
        {
            "success": bool,
            "symbol": str,
            "message": str,
            "model_info": {
                "model_type": "lstm",
                "training_period": str,
                "training_data_points": int,
                "top_features": list,
                "window_size": int,
                "lstm_units": int,
                "dropout_rate": float,
                "learning_rate": float
            }
        }
    """

    try:
        # 1. 입력 데이터 파싱 및 기본값 설정
        request_data = request.get_json() or {}

        period = request_data.get('period', '1y')  # 학습 데이터 기간
        force_retrain = request_data.get('force_retrain', False)  # 강제 재학습 여부

        # 2. 입력 값 검증
        try:
            # 주식 심볼 검증
            validate_stock_symbol(symbol.upper())

            # 기간 검증
            valid_periods = ['6mo', '1y', '2y', '5y']
            if period not in valid_periods:
                raise ValueError(f"지원하지 않는 기간입니다: {period}. 지원 기간: {valid_periods}")

        except ValueError as ve:
            logger.warning(f"입력 검증 실패 - Symbol: {symbol}, Error: {str(ve)}")
            return jsonify({
                'success': False,
                'error': 'VALIDATION_ERROR',
                'message': str(ve)
            }), 400

        # 심볼을 대문자로 정규화
        symbol = symbol.upper()

        # 3. 기존 모델 확인
        existing_model_info = prediction_model.get_model_info(symbol)
        if existing_model_info and not force_retrain:
            logger.info(f"[{symbol}] 기존 LSTM 모델이 존재합니다. 재학습을 건너뜁니다.")
            return jsonify({
                'success': True,
                'symbol': symbol,
                'message': '기존 모델이 존재합니다. 재학습을 원하면 force_retrain=true를 설정하세요.',
                'model_info': {
                    'model_type': existing_model_info['model_type'],
                    'training_period': period,
                    'training_data_points': 0,
                    'top_features': existing_model_info['top_features'],
                    'window_size': existing_model_info['window_size'],
                    'lstm_units': existing_model_info['lstm_units'],
                    'dropout_rate': existing_model_info['dropout_rate']
                },
                'timestamp': datetime.now().isoformat()
            }), 200

        logger.info(f"[{symbol}] LSTM 모델 학습 시작 - Period: {period}, Force Retrain: {force_retrain}")

        # 4. 학습 데이터 가져오기
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

        # 5. 모델 학습
        try:
            prediction_model.train_model(symbol, stock_data, force_retrain=force_retrain)
            logger.info(f"[{symbol}] LSTM 모델 학습 완료")

            # 학습 완료 후 모델 정보 가져오기
            model_info = prediction_model.get_model_info(symbol)

            # 6. 성공 응답 반환
            response_data = {
                'success': True,
                'symbol': symbol,
                'message': f'LSTM 모델 학습이 완료되었습니다. 데이터 포인트: {len(stock_data)}개',
                'model_info': {
                    'model_type': 'lstm',
                    'training_period': period,
                    'training_data_points': len(stock_data),
                    'top_features': model_info['top_features'] if model_info else [],
                    'window_size': model_info['window_size'] if model_info else 0,
                    'lstm_units': model_info['lstm_units'] if model_info else 0,
                    'dropout_rate': model_info['dropout_rate'] if model_info else 0
                },
                'timestamp': datetime.now().isoformat()
            }

            return jsonify(response_data), 200

        except Exception as e:
            logger.error(f"[{symbol}] LSTM 모델 학습 실패: {str(e)}")
            return jsonify({
                'success': False,
                'error': 'MODEL_TRAINING_ERROR',
                'message': f'LSTM 모델 학습 실패: {str(e)}'
            }), 500

    except Exception as e:
        # 예상치 못한 오류 처리
        logger.error(f"[{symbol}] 예상치 못한 오류: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'INTERNAL_SERVER_ERROR',
            'message': '서버 내부 오류가 발생했습니다.'
        }), 500


@lstm_train_bp.route('/batch', methods=['POST'])
def train_multiple_models():
    """
    여러 주식 심볼에 대한 LSTM 모델 배치 학습

    Request Body (JSON):
        {
            "symbols": ["AAPL", "GOOGL", "MSFT"],  # 학습할 주식 심볼 리스트
            "period": str,                          # 학습 데이터 기간 (기본값: "1y")
            "force_retrain": bool                   # 강제 재학습 여부 (기본값: false)
        }

    Returns:
        JSON: 배치 학습 결과
        {
            "success": bool,
            "results": [
                {
                    "symbol": str,
                    "success": bool,
                    "message": str,
                    "model_info": dict or null
                }
            ],
            "summary": {
                "total": int,
                "successful": int,
                "failed": int
            }
        }
    """

    try:
        # 1. 입력 데이터 파싱 및 기본값 설정
        request_data = request.get_json() or {}

        symbols = request_data.get('symbols', [])
        period = request_data.get('period', '1y')
        force_retrain = request_data.get('force_retrain', False)

        # 2. 입력 값 검증
        if not symbols or not isinstance(symbols, list):
            return jsonify({
                'success': False,
                'error': 'VALIDATION_ERROR',
                'message': '유효한 주식 심볼 리스트를 제공해야 합니다.'
            }), 400

        # 기간 검증
        valid_periods = ['6mo', '1y', '2y', '5y']
        if period not in valid_periods:
            return jsonify({
                'success': False,
                'error': 'VALIDATION_ERROR',
                'message': f'지원하지 않는 기간입니다: {period}. 지원 기간: {valid_periods}'
            }), 400

        logger.info(f"배치 LSTM 학습 시작 - Symbols: {symbols}, Period: {period}")

        # 3. 각 심볼에 대해 학습 수행
        results = []
        successful_count = 0
        failed_count = 0

        for symbol in symbols:
            try:
                symbol = symbol.upper()
                validate_stock_symbol(symbol)

                # 학습 데이터 가져오기
                end_date = datetime.now()
                period_days = {
                    '6mo': 180,
                    '1y': 365,
                    '2y': 730,
                    '5y': 1825
                }
                start_date = end_date - timedelta(days=period_days[period])

                stock_data = data_fetcher.fetch_stock_data(
                    symbol=symbol,
                    start_date=start_date.strftime('%Y-%m-%d'),
                    end_date=end_date.strftime('%Y-%m-%d')
                )

                if stock_data is None or stock_data.empty:
                    raise ValueError(f'주식 데이터를 가져올 수 없습니다: {symbol}')

                # 모델 학습
                prediction_model.train_model(symbol, stock_data, force_retrain=force_retrain)
                model_info = prediction_model.get_model_info(symbol)

                results.append({
                    'symbol': symbol,
                    'success': True,
                    'message': f'학습 완료 (데이터 포인트: {len(stock_data)}개)',
                    'model_info': {
                        'model_type': 'lstm',
                        'training_period': period,
                        'training_data_points': len(stock_data),
                        'top_features': model_info['top_features'] if model_info else [],
                        'window_size': model_info['window_size'] if model_info else 0,
                        'lstm_units': model_info['lstm_units'] if model_info else 0,
                        'dropout_rate': model_info['dropout_rate'] if model_info else 0
                    }
                })
                successful_count += 1
                logger.info(f"[{symbol}] 배치 학습 완료")

            except Exception as e:
                error_message = str(e)
                results.append({
                    'symbol': symbol,
                    'success': False,
                    'message': f'학습 실패: {error_message}',
                    'model_info': None
                })
                failed_count += 1
                logger.error(f"[{symbol}] 배치 학습 실패: {error_message}")

        # 4. 결과 반환
        response_data = {
            'success': True,
            'results': results,
            'summary': {
                'total': len(symbols),
                'successful': successful_count,
                'failed': failed_count
            },
            'timestamp': datetime.now().isoformat()
        }

        return jsonify(response_data), 200

    except Exception as e:
        logger.error(f"배치 학습 중 예상치 못한 오류: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'INTERNAL_SERVER_ERROR',
            'message': '배치 학습 중 서버 내부 오류가 발생했습니다.'
        }), 500