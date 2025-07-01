from flask import Blueprint, request, jsonify, current_app
from models.data_fetcher import DataFetcher
from models.stock_prediction_model import StockPredictionModel
from utils.validators import validate_stock_symbol

train_bp = Blueprint('train', __name__)
data_fetcher = DataFetcher()
prediction_model = StockPredictionModel()

@train_bp.route('/<symbol>', methods=['POST'])
def train_stock(symbol):
    try:
        if not validate_stock_symbol(symbol, current_app.config['STOCK_SYMBOLS']):
            return jsonify({'success': False, 'error': f'{symbol}을 사용할 수 없습니다.'}), 400

        current_app.logger.info(f"{symbol}에 대한 모델 학습 실행")

        stock_data = data_fetcher.get_stock_data(symbol)
        prediction_model.train_model(symbol, stock_data)

        return jsonify({
            'success': True,
            'message': f"{symbol} 모델 훈련 완료",
            'data': { 'symbol': symbol }
        })
    except Exception as e:
        current_app.logger.error(f"{symbol} 모델 훈련 실패 - {str(e)}")
        return jsonify({'success': False, 'error': f'{symbol} 모델 훈련 실패'}), 500
