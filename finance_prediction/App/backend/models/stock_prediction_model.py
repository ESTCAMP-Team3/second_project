import pandas as pd
import logging
from prophet import Prophet

class StockPredictionModel:

    def __init__(self):
        self.models = {}
        self.logger = logging.getLogger(__name__)

    # 특성 데이터 준비
    def prepare_features(self, data: pd.DataFrame) -> pd.DataFrame:
        df = data.copy()
        df = df.reset_index()
        df = df.rename(columns={"Date": "ds", "Close": "y"})

        # tz-aware 여부 체크 및 tz-naive 변환 (UTC 기준)
        if df["ds"].dt.tz is not None:
            df["ds"] = df["ds"].dt.tz_convert("UTC").dt.tz_localize(None)

        df = df[["ds", "y"]]
        df.dropna(inplace=True)

        return df

    # 모델 학습
    def train_model(self, symbol, data):
        try:
            # 인덱스가 tz-aware면 UTC 변환 후 tz-naive로 제거
            if data.index.tz is not None:
                data.index = data.index.tz_convert("UTC").tz_localize(None)

            df = self.prepare_features(data)

            model = Prophet(daily_seasonality=True)
            model.fit(df)
            self.models[symbol] = model
            self.logger.info(f"[{symbol}] 모델 학습 완료")
        except Exception as e:
            self.logger.error(f"[{symbol}] 모델 학습 실패: {e}")
            raise

    # 예측 실행
    def predict(self, symbol: str, days: int = 30) -> pd.DataFrame:
        if symbol not in self.models:
            raise ValueError(f"[{symbol}] 학습된 모델이 없습니다. 먼저 train_model을 실행하세요.")

        model = self.models[symbol]
        future = model.make_future_dataframe(periods=days)
        forecast = model.predict(future)

        result = forecast[["ds", "yhat", "yhat_lower", "yhat_upper"]]
        return result.tail(days)