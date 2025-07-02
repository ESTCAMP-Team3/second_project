import yfinance as yf
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import requests
import logging

class DataFetcher:
    def __init__(self):
        self.logger = logging.getLogger(__name__)

    # 주식 데이터 요청
    def get_stock_data(self, symbol, period = '1y'):
        try:
            ticker = yf.Ticker(symbol)
            data = ticker.history(period=period)
            self.logger.info(data)

            if data.empty:
                raise ValueError(f"{symbol} 해당 심볼에 해당하는 데이터를 찾을 수 없음.")

            return data
        except Exception as e:
            self.logger.error(f"ERROR: {e}")
            raise

    # 주식 데이터 요청 (날짜 범위 지정)
    def fetch_stock_data(self, symbol, start_date, end_date):
        try:
            ticker = yf.Ticker(symbol)
            data = ticker.history(start=start_date, end=end_date)
            self.logger.info(f"Fetched {len(data)} data points for {symbol}")

            if data.empty:
                raise ValueError(f"{symbol} 해당 심볼에 해당하는 데이터를 찾을 수 없음.")

            return data
        except Exception as e:
            self.logger.error(f"ERROR: {e}")
            raise
