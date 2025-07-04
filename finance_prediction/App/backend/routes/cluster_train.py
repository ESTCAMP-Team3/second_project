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

        request_data = request.get_json() or {}
        force_retrain = request_data.get('force_retrain', False)

        current_app.logger.info(f"{symbol}에 대한 클러스터 모델 학습 실행 (강제 재학습: {force_retrain})")

        # 클러스터 모델이 자체적으로 종목별 학습 기간을 설정하므로 데이터 없이 학습 호출
        cluster_model.train_model(symbol, data=None, force_retrain=force_retrain)

        # 모델 정보 가져오기
        model_info = cluster_model.get_model_info(symbol)

        return jsonify({
            'success': True,
            'message': f"{symbol} 클러스터 모델 훈련 완료",
            'data': {
                'symbol': symbol,
                'model_info': model_info
            }
        })
    except Exception as e:
        current_app.logger.error(f"{symbol} 클러스터 모델 훈련 실패 - {str(e)}")
        return jsonify({'success': False, 'error': f'{symbol} 클러스터 모델 훈련 실패: {str(e)}'}), 500


@cluster_train_bp.route('/<symbol>/info', methods=['GET'])
def get_cluster_model_info(symbol):
    """클러스터 모델 정보 조회"""
    try:
        if not validate_stock_symbol(symbol, current_app.config['STOCK_SYMBOLS']):
            return jsonify({'success': False, 'error': f'잘못된 주식 심볼: {symbol}'}), 400

        model_info = cluster_model.get_model_info(symbol)
        
        if not model_info:
            return jsonify({'success': False, 'error': f'{symbol} 모델이 학습되지 않았습니다.'}), 404

        return jsonify({
            'success': True,
            'data': model_info
        })
    except Exception as e:
        current_app.logger.error(f"{symbol} 클러스터 모델 정보 조회 실패 - {str(e)}")
        return jsonify({'success': False, 'error': f'{symbol} 클러스터 모델 정보 조회 실패: {str(e)}'}), 500