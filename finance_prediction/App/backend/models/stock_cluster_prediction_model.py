import pandas as pd
import numpy as np
import logging
import ta
import hdbscan
import pickle
from sklearn.preprocessing import StandardScaler
from xgboost import XGBClassifier
from sklearn.model_selection import train_test_split
from datetime import datetime
from utils.model_utils import model_manager

class StockClusterPredictionModel:

    def __init__(self):
        self.models = {}
        self.scaler = None
        self.selected_features = [
            'trend_macd', 'trend_macd_signal', 'trend_adx',
            'trend_sma_fast', 'trend_ema_fast', 'trend_aroon_up', 'trend_aroon_down',
            'momentum_rsi', 'momentum_wr', 'momentum_ao',
            'volume_obv',
            'volatility_bbp', 'volatility_atr'
        ]
        self.profitable_clusters = [0, 1]
        self.logger = logging.getLogger(__name__)

    def prepare_features(self, data: pd.DataFrame) -> pd.DataFrame:
        df = data.copy()

        if isinstance(df.columns, pd.MultiIndex):
            df.columns = df.columns.droplevel(0)
            df.columns.name = None

        required_cols = ['Open', 'High', 'Low', 'Close', 'Volume']

        column_mapping = {}
        for col in df.columns:
            col_lower = col.lower()
            if 'open' in col_lower:
                column_mapping[col] = 'Open'
            elif 'high' in col_lower:
                column_mapping[col] = 'High'
            elif 'low' in col_lower:
                column_mapping[col] = 'Low'
            elif 'close' in col_lower:
                column_mapping[col] = 'Close'
            elif 'volume' in col_lower:
                column_mapping[col] = 'Volume'

        df = df.rename(columns=column_mapping)
        df = df[required_cols]

        df_ta = ta.add_all_ta_features(
            df,
            open="Open",
            high="High",
            low="Low",
            close="Close",
            volume="Volume",
            fillna=True
        )

        df_ta['volatility_atr'] = np.log1p(df_ta['volatility_atr'])

        self.close_prices = df['Close'].copy()

        X_cluster = df_ta[self.selected_features].dropna()
        return X_cluster

    def train_model(self, symbol, data, force_retrain: bool = False):
        # 기존 모델 존재 확인
        if not force_retrain:
            existing_model_path = model_manager.get_existing_model_path("cluster", symbol)
            if existing_model_path:
                try:
                    with open(existing_model_path, 'rb') as f:
                        saved_data = pickle.load(f)
                    self.models[symbol] = saved_data['model']
                    self.scaler = saved_data['scaler']
                    self.logger.info(f"[{symbol}] 기존 클러스터 모델 로드 완료: {existing_model_path}")
                    return
                except Exception as e:
                    self.logger.warning(f"[{symbol}] 기존 모델 로드 실패: {e}, 새로 학습합니다.")
        
        try:
            if data.index.tz is not None:
                data.index = data.index.tz_convert("UTC").tz_localize(None)

            X_cluster = self.prepare_features(data)

            self.scaler = StandardScaler()
            X_scaled = self.scaler.fit_transform(X_cluster)
            X_scaled_df = pd.DataFrame(X_scaled, columns=X_cluster.columns, index=X_cluster.index)

            clusterer = hdbscan.HDBSCAN(min_cluster_size=10)
            labels = clusterer.fit_predict(X_scaled_df)

            X_scaled_df['cluster'] = labels

            cluster_probs = clusterer.probabilities_
            confident_mask = cluster_probs >= 0.85

            X_confident = X_scaled_df.loc[confident_mask].drop(columns='cluster')
            y_confident = X_scaled_df.loc[confident_mask, 'cluster']

            if len(y_confident.unique()) > 1:
                X_train, X_test, y_train, y_test = train_test_split(
                    X_confident, y_confident, test_size=0.2, random_state=42, stratify=y_confident
                )
            else:
                X_train, X_test, y_train, y_test = train_test_split(
                    X_confident, y_confident, test_size=0.2, random_state=42
                )

            model = XGBClassifier(use_label_encoder=False, eval_metric='mlogloss', random_state=42)
            model.fit(X_train, y_train)

            self.models[symbol] = model
            
            # 모델과 스케일러 파일로 저장
            model_path = model_manager.get_model_path("cluster", symbol)
            model_data = {
                'model': model,
                'scaler': self.scaler,
                'selected_features': self.selected_features,
                'profitable_clusters': self.profitable_clusters
            }
            with open(model_path, 'wb') as f:
                pickle.dump(model_data, f)
            
            # 메타데이터 저장
            metadata = {
                'symbol': symbol,
                'model_type': 'cluster',
                'training_date': datetime.now().isoformat(),
                'data_points': len(X_cluster),
                'features': self.selected_features,
                'profitable_clusters': self.profitable_clusters
            }
            model_manager.save_model_metadata("cluster", symbol, metadata)
            
            # 오래된 모델 정리
            model_manager.cleanup_old_models("cluster", symbol)
            
            self.logger.info(f"[{symbol}] 클러스터 모델 학습 및 저장 완료")
        except Exception as e:
            self.logger.error(f"[{symbol}] 모델 학습 실패: {e}")
            raise

    def predict(self, symbol: str, data: pd.DataFrame, days: int = 10) -> pd.DataFrame:
        if symbol not in self.models:
            raise ValueError(f"[{symbol}] 학습된 모델이 없습니다. 먼저 train_model을 실행하세요.")

        if self.scaler is None:
            raise ValueError("스케일러가 학습되지 않았습니다.")

        try:
            X_cluster = self.prepare_features(data)

            missing_cols = list(set(self.selected_features) - set(X_cluster.columns))
            for col in missing_cols:
                X_cluster[col] = 0

            X_ordered = X_cluster[self.selected_features]
            X_scaled = self.scaler.transform(X_ordered)

            model = self.models[symbol]
            cluster_preds = model.predict(X_scaled)

            close_prices_aligned = self.close_prices.reindex(X_cluster.index).fillna(method='ffill')

            result = pd.DataFrame({
                'ds': X_cluster.index,
                'cluster_pred': cluster_preds,
                'entry_signal': pd.Series(cluster_preds).isin(self.profitable_clusters).astype(int),
                'close': close_prices_aligned
            })

            return result.tail(days)
        except Exception as e:
            self.logger.error(f"[{symbol}] 예측 실패: {e}")
            raise