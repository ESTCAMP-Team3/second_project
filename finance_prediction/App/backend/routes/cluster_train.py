from flask import Blueprint, request, jsonify, current_app
from models.data_fetcher import DataFetcher
from models.stock_cluster_prediction_model import StockClusterPredictionModel
from utils.validators import validate_stock_symbol

cluster_train_bp = Blueprint('cluster_train', __name__)
data_fetcher = DataFetcher()
cluster_model = StockClusterPredictionModel()

@cluster_train_bp.route('/<symbol>', methods=['POST'])
def train_cluster_model(symbol):
    try:
        if not validate_stock_symbol(symbol, current_app.config['STOCK_SYMBOLS']):
            return jsonify({'success': False, 'error': f'{symbol}을 사용할 수 없습니다.'}), 400

        current_app.logger.info(f"{symbol}에 대한 클러스터 모델 학습 실행")

        stock_data = data_fetcher.get_stock_data(symbol)
        cluster_model.train_model(symbol, stock_data)

        return jsonify({
            'success': True,
            'message': f"{symbol} 클러스터 모델 훈련 완료",
            'data': { 'symbol': symbol }
        })
    except Exception as e:
        current_app.logger.error(f"{symbol} 클러스터 모델 훈련 실패 - {str(e)}")
        return jsonify({'success': False, 'error': f'{symbol} 클러스터 모델 훈련 실패'}), 500