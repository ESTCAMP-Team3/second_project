from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime

import logging
import traceback

from config.config import Config
from utils.validators import validate_prediction_request
from models.data_fetcher import DataFetcher
from models.stock_prediction_model import StockPredictionModel
from utils.validators import validate_stock_symbol

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)

app = Flask(__name__)
app.config.from_object(Config)
CORS(app)

data_fetcher = DataFetcher()
prediction_model = StockPredictionModel()

@app.route('/')
def index():
    return jsonify({
        'status': 'success',
        'message': 'Finance Prediction API',
        'version': '1.0',
        'timestamp': datetime.now().isoformat(),
    })

# 사용가능한 주식 목록 반환 엔드포인트
@app.route('/api/stocks', methods=['GET'])
def get_available_stocks():
    try:
        stocks = []
        for symbol, name in app.config['STOCK_SYMBOLS'].items():
            stock_type = 'domestic' if '.KS' in symbol else 'international'
            stocks.append({
                'symbol': symbol,
                'name': name,
                'type': stock_type,
            })

        return jsonify({
            'status': True,
            'data': stocks,
            'total': len(stocks),
        })

    except Exception as e:
        app.logger.error(f"ERROR: 주식 리스트 요청 실패 {e}")
        return jsonify({
            'status': False,
            'error': '주식 리스트 불러오기 오류',
        }), 500

# 주식 예측 엔드포인트
@app.route('/api/predict/<symbol>', methods=['POST'])
def predict_stock(symbol):
    try:
        if not validate_stock_symbol(symbol, app.config['STOCK_SYMBOLS']):
            return jsonify({
                'status': False,
                'error': f'잘못된 주식 심볼: {symbol}',
            }), 400

        request_data = request.get_json() or {}
        validation_result = validate_prediction_request(request_data)

        if not validation_result['valid']:
            return jsonify({
                'success': False,
                'error': validation_result['error'],
            }), 400

        periods = request_data.get('periods', ['short', 'medium', 'long'])

        app.logger.info(f"{symbol} 예측 시작, 기간: {periods}")

        # 데이터 수집/ 해당 부분 DB 호출 만약 데이터 없을 경우 api 호출
        try:
            stock_data = data_fetcher.get_stock_data(symbol, periods)
            if stock_data.empty:
                raise ValueError("수식 데이터가 없습니다.")
        except Exception as e:
            app.logger.error(f"ERROR: {symbol} 데이터 패치 오류 - {e}")

            # - TODO: 구현
            return jsonify({
                'success': False,
                'error': f'{symbol} 데이터 요청 실패'
            })

        # 에측 실행
        try:
            predictions = prediction_model.predict(symbol, stock_data, periods)

            # 현재 주식 정보 - TODO: 구현
            current_info = {
               'symbol': symbol,
                'name': app.config['STOCK_SYMBOLS'][symbol]
            }

            # 예측 결과 - TODO: 구현
            formatted_predictions = {}

            # - TODO: 구현
            return jsonify({
                'success': True,
                'data': {
                   'stock_info': current_info,
                    'predictions': predictions,
                    'metadata': {

                    }
                }
            })

        except Exception as e:
            app.logger.error(f"ERROR: {symbol} 예측 오류 - {str(e)}")
            return jsonify({
                'success': False,
                'error': f'{symbol} 예측 실패'
            }), 500

    except Exception as e:
        app.logger.error(f"ERROR: 예기치 못한 예측 오류 발생 - {str(e)}")
        return jsonify({
            'success': False,
            'error': "서버 오류"
        }), 500

# 모델 학습 엔드포인트
@app.route('/app/train/<symbol>', methods=['POST'])
def train_stock(symbol):
   try:
       if not validate_stock_symbol(symbol, app.config['STOCK_SYMBOLS']):
           return jsonify({
               'success': False,
               'error': f'{symbol}을 사용할 수 없습니다.'
           }), 400

       app.logger.info(f"{symbol}에 대한 모델 학습 실행")

       #데이터 수집
       stock_data = data_fetcher.get_stock_data(symbol)

       prediction_model.train_model(symbol, stock_data)

        # TODO - 리턴 구현
       return jsonify({
           'success': True,
           'message': f"{symbol} 모델 훈련 완료",
           'data': {
                'symbol': symbol
           }
       })

   except Exception as e:
       app.logger.error(f"{symbol}")

       return jsonify({
           'success': False,
           'error': f'{symbol} 모델 훈련 실패'
       }), 500


@app.errorhandler(404)
def not_found(error):
    return jsonify({
        'success': False,
        'error': 'Endpoint not found'
    }), 404


@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        'success': False,
        'error': 'Internal server error'
    }), 500


if __name__ == '__main__':
    # 환경 변수 또는 기본값 사용
    import os

    host = os.environ.get('FLASK_HOST', '0.0.0.0')
    port = int(os.environ.get('FLASK_PORT', 5000))
    debug = os.environ.get('FLASK_DEBUG', 'False').lower() == 'true'

    app.run(host=host, port=port, debug=debug)