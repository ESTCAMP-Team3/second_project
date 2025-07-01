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
        'QQQ': 'Invesco QQQ Trust'
    }

    # 에측 기간
    PREDICTION_PERIODS = {
        'short': {'days': 7, 'name': '단기'},
        'medium': {'days': 30, 'name': '중기'},
        'long': {'days': 90, 'name': '장기'}
    }
