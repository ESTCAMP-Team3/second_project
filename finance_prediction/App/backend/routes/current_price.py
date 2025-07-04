from flask import Blueprint, jsonify
from models.data_fetcher import DataFetcher
from utils.validators import validate_stock_symbol
import logging

current_price_bp = Blueprint('current_price', __name__)

data_fetcher = DataFetcher()
logger = logging.getLogger(__name__)

@current_price_bp.route('/<symbol>', methods=['GET'])
def get_current_price(symbol):
    """
    특정 주식의 현재 가격을 가져오는 엔드포인트
    
    Args:
        symbol (str): 주식 심볼 (예: AAPL, GOOGL, MSFT)
    
    Returns:
        JSON: 현재 가격 또는 에러 메시지
        {
            "success": bool,
            "symbol": str,
            "price": float,
            "error": str (optional)
        }
    """
    try:
        symbol = symbol.upper()
        
        # 주식 심볼 검증
        try:
            validate_stock_symbol(symbol)
        except ValueError as ve:
            logger.warning(f"입력 검증 실패 - Symbol: {symbol}, Error: {str(ve)}")
            return jsonify({
                'success': False,
                'error': 'VALIDATION_ERROR',
                'message': str(ve)
            }), 400
        
        # 최근 1일 데이터 가져오기
        stock_data = data_fetcher.get_stock_data(symbol, period='1d')
        
        if stock_data is None or stock_data.empty:
            logger.error(f"[{symbol}] 주식 데이터를 가져올 수 없습니다.")
            return jsonify({
                'success': False,
                'error': 'DATA_FETCH_ERROR',
                'message': f'주식 데이터를 가져올 수 없습니다: {symbol}'
            }), 404
        
        # 현재 가격 (가장 최근 Close 가격)
        current_price = float(stock_data['Close'].iloc[-1])
        
        logger.info(f"[{symbol}] 현재 가격 조회 완료: {current_price}")
        
        return jsonify({
            'success': True,
            'symbol': symbol,
            'price': round(current_price, 2)
        }), 200
        
    except Exception as e:
        logger.error(f"[{symbol}] 현재 가격 조회 실패: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'INTERNAL_SERVER_ERROR',
            'message': '서버 내부 오류가 발생했습니다.'
        }), 500