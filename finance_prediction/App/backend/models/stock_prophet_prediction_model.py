import pandas as pd
import logging
import pickle
from prophet import Prophet
from typing import Optional
from datetime import datetime
from utils.model_utils import model_manager


class StockProphetPredictionModel:

    def __init__(self):
        """
        모델 초기화
        - models: 각 주식 심볼별로 학습된 Prophet 모델을 저장하는 딕셔너리
        - logger: 로깅을 위한 로거 객체
        """
        self.models = {}
        self.logger = logging.getLogger(__name__)

    def prepare_features(self, data: pd.DataFrame) -> pd.DataFrame:
        """
        Prophet 모델에 사용할 데이터 전처리

        Args:
            data (pd.DataFrame): 원본 주식 데이터 (Date 인덱스, Close 컬럼 포함)

        Returns:
            pd.DataFrame: Prophet 형식에 맞게 변환된 데이터 (ds, y 컬럼)

        Note:
            - Prophet은 'ds' (날짜), 'y' (타겟값) 컬럼명을 요구함
            - 시간대 정보가 있는 경우 UTC로 변환 후 제거
        """
        df = data.copy()
        df = df.reset_index()

        # 컬럼명 변경: Date -> ds, Close -> y (Prophet 요구사항)
        df = df.rename(columns={"Date": "ds", "Close": "y"})

        # 타임존 처리: tz-aware인 경우 UTC로 변환 후 tz-naive로 변경
        if df["ds"].dt.tz is not None:
            df["ds"] = df["ds"].dt.tz_convert("UTC").dt.tz_localize(None)

        # Prophet에 필요한 컬럼만 선택
        df = df[["ds", "y"]]

        # 결측값 제거
        df.dropna(inplace=True)

        # 데이터 검증
        if len(df) < 2:
            raise ValueError("예측을 위해서는 최소 2개 이상의 데이터 포인트가 필요합니다.")

        return df

    def train_model(self, symbol: str, data: pd.DataFrame, force_retrain: bool = False) -> None:
        """
        특정 주식 심볼에 대한 Prophet 모델 학습

        Args:
            symbol (str): 주식 심볼 (예: 'AAPL', 'GOOGL')
            data (pd.DataFrame): 학습용 주식 데이터
            force_retrain (bool): 강제 재학습 여부 (기본값: False)

        Raises:
            Exception: 모델 학습 중 오류 발생 시

        Note:
            - daily_seasonality=True: 일별 계절성 패턴 고려
            - weekly_seasonality=True: 주별 계절성 패턴 고려 (기본값)
            - yearly_seasonality=True: 연별 계절성 패턴 고려 (기본값)
        """
        # 기존 모델 존재 확인
        if not force_retrain:
            existing_model_path = model_manager.get_existing_model_path("prophet", symbol)
            if existing_model_path:
                try:
                    with open(existing_model_path, 'rb') as f:
                        model = pickle.load(f)
                    self.models[symbol] = model
                    self.logger.info(f"[{symbol}] 기존 모델 로드 완료: {existing_model_path}")
                    return
                except Exception as e:
                    self.logger.warning(f"[{symbol}] 기존 모델 로드 실패: {e}, 새로 학습합니다.")
        
        try:
            # 데이터 인덱스의 타임존 처리
            if hasattr(data.index, 'tz') and data.index.tz is not None:
                data.index = data.index.tz_convert("UTC").tz_localize(None)

            # Prophet 형식으로 데이터 전처리
            df = self.prepare_features(data)

            # Prophet 모델 생성 및 설정
            model = Prophet(
                daily_seasonality=True,  # 일별 계절성 활성화
                weekly_seasonality=True,  # 주별 계절성 활성화 (기본값)
                yearly_seasonality=True,  # 연별 계절성 활성화 (기본값)
                seasonality_mode='multiplicative',  # 계절성 모드 (additive/multiplicative)
                changepoint_prior_scale=0.05,  # 변화점 민감도 조정
                seasonality_prior_scale=10.0  # 계절성 강도 조정
            )

            # 모델 학습 실행
            model.fit(df)

            # 학습된 모델을 딕셔너리에 저장
            self.models[symbol] = model

            # 모델 파일로 저장
            model_path = model_manager.get_model_path("prophet", symbol)
            with open(model_path, 'wb') as f:
                pickle.dump(model, f)
            
            # 메타데이터 저장
            metadata = {
                'symbol': symbol,
                'model_type': 'prophet',
                'training_date': datetime.now().isoformat(),
                'data_points': len(df),
                'parameters': {
                    'daily_seasonality': True,
                    'weekly_seasonality': True,
                    'yearly_seasonality': True,
                    'seasonality_mode': 'multiplicative',
                    'changepoint_prior_scale': 0.05,
                    'seasonality_prior_scale': 10.0
                }
            }
            model_manager.save_model_metadata("prophet", symbol, metadata)
            
            # 오래된 모델 정리
            model_manager.cleanup_old_models("prophet", symbol)

            self.logger.info(f"[{symbol}] 모델 학습 및 저장 완료 (데이터 포인트: {len(df)}개)")

        except Exception as e:
            self.logger.error(f"[{symbol}] 모델 학습 실패: {e}")
            raise

    def predict(self, symbol: str, days: int = 5) -> pd.DataFrame:
        """
        학습된 모델을 사용하여 미래 주가 예측

        Args:
            symbol (str): 예측할 주식 심볼
            days (int): 예측할 일수 (기본값: 5일)

        Returns:
            pd.DataFrame: 예측 결과
                - ds: 예측 날짜
                - yhat: 예측 가격
                - yhat_lower: 예측 가격 하한선 (신뢰구간)
                - yhat_upper: 예측 가격 상한선 (신뢰구간)

        Raises:
            ValueError: 해당 심볼에 대한 학습된 모델이 없는 경우
        """
        # 학습된 모델 존재 여부 확인
        if symbol not in self.models:
            raise ValueError(f"[{symbol}] 학습된 모델이 없습니다. 먼저 train_model을 실행하세요.")

        # 검증: 예측 일수가 유효한 범위인지 확인
        if days <= 0:
            raise ValueError("예측 일수는 1 이상이어야 합니다.")

        if days > 365:
            self.logger.warning(f"[{symbol}] 장기 예측({days}일)은 정확도가 낮을 수 있습니다.")

        try:
            # 저장된 모델 가져오기
            model = self.models[symbol]

            # 미래 날짜 프레임 생성 (기존 데이터 + 예측할 기간)
            future = model.make_future_dataframe(periods=days)

            # 예측 실행
            forecast = model.predict(future)

            # 결과에서 필요한 컬럼만 선택
            result = forecast[["ds", "yhat", "yhat_lower", "yhat_upper"]].copy()

            # 컬럼명을 더 직관적으로 변경
            result.columns = ["날짜", "예측가격", "하한가격", "상한가격"]

            # 미래 예측 부분만 반환 (마지막 days만큼)
            prediction_result = result.tail(days).reset_index(drop=True)

            self.logger.info(f"[{symbol}] {days}일 예측 완료")

            return prediction_result

        except Exception as e:
            self.logger.error(f"[{symbol}] 예측 실행 실패: {e}")
            raise

    def get_model_info(self, symbol: str) -> Optional[dict]:
        """
        특정 심볼의 모델 정보 조회

        Args:
            symbol (str): 조회할 주식 심볼

        Returns:
            dict: 모델 정보 (학습 데이터 개수, 파라미터 등)
            None: 해당 심볼의 모델이 없는 경우
        """
        if symbol not in self.models:
            return None

        model = self.models[symbol]
        return {
            "symbol": symbol,
            "training_data_points": len(model.history),
            "changepoints": len(model.changepoints),
            "seasonalities": list(model.seasonalities.keys())
        }