from flask import Blueprint, jsonify, current_app
from datetime import datetime

base_bp = Blueprint('base', __name__)

@base_bp.route('/')
def index():
    return jsonify({
        'status': 'success',
        'message': 'Finance Prediction API',
        'version': '1.0',
        'timestamp': datetime.now().isoformat(),
    })

@base_bp.route('/api/stocks', methods=['GET'])
def get_available_stocks():
    try:
        stocks = []
        for symbol, name in current_app.config['STOCK_SYMBOLS'].items():
            stock_type = 'domestic' if '.KS' in symbol else 'international'
            stocks.append({'symbol': symbol, 'name': name, 'type': stock_type})
        return jsonify({'status': True, 'data': stocks, 'total': len(stocks)})
    except Exception as e:
        current_app.logger.error(f"ERROR: 주식 리스트 요청 실패 {e}")
        return jsonify({'status': False, 'error': '주식 리스트 불러오기 오류'}), 500