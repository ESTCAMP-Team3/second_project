from flask import Blueprint, request, jsonify, current_app
from models.data_fetcher import DataFetcher
from models.stock_cluster_prediction_model import StockClusterPredictionModel
from utils.validators import validate_stock_symbol

cluster_predict_bp = Blueprint('cluster_predict', __name__)
data_fetcher = DataFetcher()
cluster_model = StockClusterPredictionModel()


@cluster_predict_bp.route('/<symbol>', methods=['POST'])
def predict_cluster_signals(symbol):
    try:
        if not validate_stock_symbol(symbol, current_app.config['STOCK_SYMBOLS']):
            return jsonify({'success': False, 'error': f'잘못된 주식 심볼: {symbol}'}), 400

        request_data = request.get_json() or {}
        days = request_data.get('days', 10)

        if not isinstance(days, int) or days < 1 or days > 30:
            return jsonify({'success': False, 'error': '예측 일수는 1-30일 사이여야 합니다'}), 400

        current_app.logger.info(f"{symbol} 클러스터 예측 시작, 예측 일수: {days}일")

        stock_data = data_fetcher.get_stock_data(symbol)
        if stock_data.empty:
            return jsonify({'success': False, 'error': f'{symbol} 데이터를 가져올 수 없습니다'}), 400

        cluster_model.train_model(symbol, stock_data)

        forecast = cluster_model.predict(symbol, stock_data, days=days)

        result = []
        for i, row in forecast.iterrows():
            result.append({
                "date": str(row["ds"].date()) if hasattr(row["ds"], 'date') else str(row["ds"]),
                "cluster": int(row["cluster_pred"]),
                "entry_signal": int(row["entry_signal"]),
                "signal_description": "매수 신호" if row["entry_signal"] == 1 else "관망"
            })

        entry_signals = len([r for r in result if r["entry_signal"] == 1])

        return jsonify({
            "success": True,
            "data": {
                "symbol": symbol,
                "predictions": result,
                "summary": {
                    "total_days": len(result),
                    "entry_signals": entry_signals,
                    "signal_ratio": round(entry_signals / len(result) * 100, 2) if result else 0
                }
            }
        })

    except Exception as e:
        current_app.logger.error(f"{symbol} 클러스터 예측 실패 - {str(e)}")
        return jsonify({'success': False, 'error': f'{symbol} 클러스터 예측 실패'}), 500