from flask import Blueprint, request, jsonify, current_app
from models.data_fetcher import DataFetcher
from models.stock_prediction_model import StockPredictionModel
from utils.validators import validate_prediction_request, validate_stock_symbol

predict_bp = Blueprint('predict', __name__)
data_fetcher = DataFetcher()
prediction_model = StockPredictionModel()

@predict_bp.route('/<symbol>', methods=['POST'])
def predict_stock(symbol):
    try:
        if not validate_stock_symbol(symbol, current_app.config['STOCK_SYMBOLS']):
            return jsonify({'success': False, 'error': f'잘못된 주식 심볼: {symbol}'}), 400

        request_data = request.get_json() or {}
        validation_result = validate_prediction_request(request_data)

        if not validation_result['valid']:
            return jsonify({'success': False, 'error': validation_result['error']}), 400

        periods = request_data.get('periods', ['short', 'medium', 'long'])
        current_app.logger.info(f"{symbol} 예측 시작, 기간: {periods}")

        stock_data = data_fetcher.get_stock_data(symbol, periods)
        if stock_data.empty:
            raise ValueError("주식 데이터가 없습니다.")

        predictions = prediction_model.predict(symbol, stock_data, periods)

        return jsonify({
            'success': True,
            'data': {
                'stock_info': {
                    'symbol': symbol,
                    'name': current_app.config['STOCK_SYMBOLS'][symbol]
                },
                'predictions': predictions,
                'metadata': {}
            }
        })
    except Exception as e:
        current_app.logger.error(f"{symbol} 예측 실패 - {str(e)}")
        return jsonify({'success': False, 'error': f'{symbol} 예측 실패'}), 500