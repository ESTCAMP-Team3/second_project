# 주식 심볼 유효성 체크
def validate_stock_symbol(symbol, valid_symbols):
    return symbol in valid_symbols


#예측 요청 데이터 검증
def validate_prediction_request(request_data):
    result = {'valid': True, 'error': None}

    if not isinstance(request_data, dict):
        result['valid'] = False
        result['error'] = 'Request data must be a JSON object'
        return result

    # 예측 기간 검증
    periods = request_data.get('periods', ['short', 'medium', 'long'])
    valid_periods = ['short', 'medium', 'long']

    if not isinstance(periods, list):
        result['valid'] = False
        result['error'] = 'Periods must be a list'
        return result

    invalid_periods = [p for p in periods if p not in valid_periods]
    if invalid_periods:
        result['valid'] = False
        result['error'] = f'Invalid periods: {invalid_periods}. Valid periods: {valid_periods}'
        return result

    return result