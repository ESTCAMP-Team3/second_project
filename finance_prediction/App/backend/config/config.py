import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # Flask 설정
    DEBUG = os.environ.get("FLASK_DEBUG", "False").lower() == "true"

    # API 설정

    # 주식 심볼 맵핑
    STOCK_SYMBOLS = {
        # 해외 주식
        'TSLA': 'Tesla',
        'AAPL': 'Apple',
        'NVDA': 'Nvidia',
        'MSFT': 'Microsoft',
        'AMZN': 'Amazon',
        'AMD': 'Advanced Micro Devices',
        'META': 'Meta Platforms',
        'GOOGL': 'Alphabet',
        'SPY': 'SPDR S&P 500 ETF',
        'QQQ': 'Invesco QQQ Trust',

        # 국내 주식 (KRX 접미사 추가)
        '005930.KS': '삼성전자',
        '000660.KS': 'SK하이닉스',
        '005380.KS': '현대차',
        '035420.KS': '네이버',
        '035720.KS': '카카오',
        '373220.KS': 'LG에너지솔루션',
        '006400.KS': '삼성SDI',
        '005490.KS': 'POSCO홀딩스',
        '105560.KS': 'KB금융',
        '068270.KS': '셀트리온'
    }

    # 에측 기간
    PREDICTION_PERIODS = {
        'short': {'days': 7, 'name': '단기'},
        'medium': {'days': 30, 'name': '중기'},
        'long': {'days': 90, 'name': '장기'}
    }
