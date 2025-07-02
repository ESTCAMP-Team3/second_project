# 주식 심볼 유효성 체크
def validate_stock_symbol(symbol, valid_symbols=None):
    if valid_symbols is not None:
        return symbol.upper() in valid_symbols
    # 기본적인 주식 심볼 형식 검증
    if not isinstance(symbol, str) or len(symbol) < 1 or len(symbol) > 10:
        raise ValueError("주식 심볼은 1-10자의 문자열이어야 합니다.")
    if not symbol.replace('.', '').replace('-', '').isalnum():
        raise ValueError("주식 심볼에는 영문자, 숫자, '.', '-'만 포함될 수 있습니다.")
    return True


#예측 요청 데이터 검증
def validate_prediction_request(request_data):
    if not isinstance(request_data, dict):
        raise ValueError('Request data must be a JSON object')

    # days 검증
    days = request_data.get('days', 5)
    if not isinstance(days, int) or days < 1 or days > 30:
        raise ValueError('days는 1에서 30 사이의 정수여야 합니다.')

    # period 검증
    period = request_data.get('period', '1y')
    valid_periods = ['6mo', '1y', '2y', '5y']
    if period not in valid_periods:
        raise ValueError(f'period는 다음 중 하나여야 합니다: {valid_periods}')

    # retrain 검증
    retrain = request_data.get('retrain', False)
    if not isinstance(retrain, bool):
        raise ValueError('retrain은 boolean 값이어야 합니다.')

    return True