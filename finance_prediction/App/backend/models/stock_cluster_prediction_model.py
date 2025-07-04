import pandas as pd
import numpy as np
import logging
import pickle
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from collections import Counter, defaultdict
from datetime import datetime, timedelta
from typing import Optional, Dict, Tuple
from utils.model_utils import model_manager
import ta


class StockClusterPredictionModel:
    
    def __init__(self):
        """
        클러스터 기반 주식 예측 모델 초기화
        
        - models: 각 주식 심볼별로 학습된 클러스터 모델 저장
        - scalers: 각 주식 심볼별 스케일러 저장
        - cluster_data: 클러스터별 과거 수익률 패턴 저장
        """
        self.models = {}
        self.scalers = {}
        self.cluster_data = {}
        self.lookback_days = 5
        self.forward_days = 5
        self.return_threshold = 0.05
        self.n_clusters = 12
        self.selected_features = [
            'trend_macd', 'trend_macd_diff', 'volatility_bbw',
            'momentum_rsi', 'volume_cmf', 'volume_obv'
        ]
        self.logger = logging.getLogger(__name__)

    def prepare_features(self, data: pd.DataFrame) -> pd.DataFrame:
        """
        클러스터링에 사용할 기술적 지표 계산 및 전처리
        
        Args:
            data (pd.DataFrame): 원본 주식 데이터
            
        Returns:
            pd.DataFrame: 클러스터링용 기술적 지표 데이터
        """
        df = data.copy()
        
        # 타임존 처리
        if hasattr(df.index, 'tz') and df.index.tz is not None:
            df.index = df.index.tz_convert("UTC").tz_localize(None)
        
        # 기술적 지표 계산
        df_ta = ta.add_all_ta_features(df, open="Open", high="High", low="Low", close="Close", volume="Volume", fillna=True)
        
        # 선택된 기술적 지표 추출
        cluster_df = df_ta[self.selected_features].copy()
        cluster_df['volume_obv_diff'] = cluster_df['volume_obv'].diff()
        
        # 최종 특성 선택
        final_features = ['trend_macd', 'trend_macd_diff', 'volatility_bbw',
                          'momentum_rsi', 'volume_cmf', 'volume_obv_diff']
        cluster_df = cluster_df[final_features].dropna()
        
        return cluster_df

    def _get_training_period(self, symbol: str) -> str:
        """
        종목별 학습 기간 설정
        
        Args:
            symbol (str): 주식 심볼
            
        Returns:
            str: 학습 기간 ('4y' 또는 '5y')
        """
        # 테슬라는 4년, 나머지는 5년
        if symbol.upper() == 'TSLA':
            return '4y'
        else:
            return '5y'

    def train_model(self, symbol: str, data: pd.DataFrame = None, force_retrain: bool = False) -> None:
        """
        특정 주식 심볼에 대한 클러스터 모델 학습
        
        Args:
            symbol (str): 주식 심볼
            data (pd.DataFrame): 학습용 주식 데이터 (None인 경우 자동으로 데이터 가져옴)
            force_retrain (bool): 강제 재학습 여부
        """
        # 기존 모델 로드 확인
        if not force_retrain:
            existing_model_path = model_manager.get_existing_model_path("cluster", symbol)
            if existing_model_path:
                try:
                    with open(existing_model_path, 'rb') as f:
                        saved_data = pickle.load(f)
                    self.models[symbol] = saved_data['model']
                    self.scalers[symbol] = saved_data['scaler']
                    self.cluster_data[symbol] = saved_data['cluster_data']
                    self.logger.info(f"[{symbol}] 기존 클러스터 모델 로드 완료: {existing_model_path}")
                    return
                except Exception as e:
                    self.logger.warning(f"[{symbol}] 기존 모델 로드 실패: {e}, 새로 학습합니다.")
        
        # 데이터가 제공되지 않은 경우 직접 가져오기
        if data is None:
            from models.data_fetcher import DataFetcher
            data_fetcher = DataFetcher()
            training_period = self._get_training_period(symbol)
            data = data_fetcher.get_stock_data(symbol, period=training_period)
            self.logger.info(f"[{symbol}] {training_period} 기간의 데이터를 가져왔습니다.")
        
        try:
            # 타임존 처리 - 원본 데이터에 적용
            if hasattr(data.index, 'tz') and data.index.tz is not None:
                data = data.copy()
                data.index = data.index.tz_convert("UTC").tz_localize(None)
            
            # 기술적 지표 계산
            cluster_df = self.prepare_features(data)
            
            if len(cluster_df) < self.lookback_days + self.forward_days + 50:
                raise ValueError(f"데이터가 부족합니다. 최소 {self.lookback_days + self.forward_days + 50}개의 데이터가 필요합니다.")
            
            # 특성 스케일링
            scaler = StandardScaler()
            scaled_features = scaler.fit_transform(cluster_df)
            scaled_df = pd.DataFrame(scaled_features, index=cluster_df.index, columns=cluster_df.columns)
            
            # K-means 클러스터링
            kmeans = KMeans(n_clusters=self.n_clusters, random_state=42, n_init=10)
            scaled_df['cluster'] = kmeans.fit_predict(scaled_df)
            
            # 종가와 결합
            price_cluster_df = scaled_df[['cluster']].join(data[['Close']], how='left')
            
            # 시퀀스별 수익률 패턴 분석
            successful_sequences = Counter()
            returns_by_sequence = defaultdict(list)
            
            for i in range(len(price_cluster_df) - self.lookback_days - self.forward_days):
                seq = tuple(price_cluster_df['cluster'].iloc[i:i + self.lookback_days])
                start_price = price_cluster_df['Close'].iloc[i + self.lookback_days - 1]
                end_price = price_cluster_df['Close'].iloc[i + self.lookback_days + self.forward_days - 1]
                ret = (end_price - start_price) / start_price
                
                returns_by_sequence[seq].append(ret * 100)
                
                if ret >= self.return_threshold:
                    successful_sequences[seq] += 1
            
            # 모델 저장
            self.models[symbol] = {
                'kmeans': kmeans,
                'successful_sequences': successful_sequences,
                'price_cluster_df': price_cluster_df
            }
            self.scalers[symbol] = scaler
            self.cluster_data[symbol] = {
                'returns_by_sequence': dict(returns_by_sequence),
                'successful_sequences': dict(successful_sequences)
            }
            
            # 파일 저장
            model_path = model_manager.get_model_path("cluster", symbol)
            model_data = {
                'model': self.models[symbol],
                'scaler': scaler,
                'cluster_data': self.cluster_data[symbol],
                'lookback_days': self.lookback_days,
                'forward_days': self.forward_days,
                'return_threshold': self.return_threshold,
                'n_clusters': self.n_clusters,
                'training_period': self._get_training_period(symbol)
            }
            with open(model_path, 'wb') as f:
                pickle.dump(model_data, f)
            
            # 메타데이터 저장
            metadata = {
                'symbol': symbol,
                'model_type': 'cluster',
                'training_date': datetime.now().isoformat(),
                'data_points': len(cluster_df),
                'n_clusters': self.n_clusters,
                'lookback_days': self.lookback_days,
                'forward_days': self.forward_days,
                'return_threshold': self.return_threshold,
                'training_period': self._get_training_period(symbol)
            }
            model_manager.save_model_metadata("cluster", symbol, metadata)
            
            # 오래된 모델 정리
            model_manager.cleanup_old_models("cluster", symbol)
            
            training_period = self._get_training_period(symbol)
            self.logger.info(f"[{symbol}] 클러스터 모델 학습 및 저장 완료 (학습 기간: {training_period}, 데이터 포인트: {len(cluster_df)}개)")
            
        except Exception as e:
            self.logger.error(f"[{symbol}] 모델 학습 실패: {e}")
            raise

    def predict(self, symbol: str, days: int = 5) -> pd.DataFrame:
        """
        클러스터 기반 매수/매도/관망 시그널 예측
        
        Args:
            symbol (str): 예측할 주식 심볼
            days (int): 예측 기간 (기본값: 5일)
            
        Returns:
            pd.DataFrame: 예측 결과 (날짜, 시그널, 신뢰도, 예상수익률)
        """
        if symbol not in self.models:
            raise ValueError(f"[{symbol}] 학습된 모델이 없습니다. 먼저 train_model을 실행하세요.")
        
        if days <= 0:
            raise ValueError("예측 일수는 1 이상이어야 합니다.")
        
        try:
            model_data = self.models[symbol]
            cluster_data = self.cluster_data[symbol]
            
            # 현재 시퀀스 추출
            price_cluster_df = model_data['price_cluster_df']
            current_sequence = tuple(price_cluster_df['cluster'].iloc[-self.lookback_days:].values)
            
            # 시그널 결정
            signal, confidence, expected_return = self._determine_signal(current_sequence, cluster_data)
            
            # 예측 결과 생성
            future_dates = pd.date_range(start=datetime.now().date() + timedelta(days=1), periods=days, freq='D')
            
            result = pd.DataFrame({
                '날짜': future_dates,
                '시그널': [signal] * days,
                '신뢰도': [confidence] * days,
                '예상수익률': [expected_return] * days
            })
            
            self.logger.info(f"[{symbol}] {days}일 클러스터 예측 완료 - 시그널: {signal}, 신뢰도: {confidence:.2f}")
            
            return result
            
        except Exception as e:
            self.logger.error(f"[{symbol}] 예측 실행 실패: {e}")
            raise

    def _determine_signal(self, current_sequence: Tuple, cluster_data: Dict) -> Tuple[str, float, float]:
        """
        현재 시퀀스를 기반으로 매수/매도/관망 시그널 결정
        
        Args:
            current_sequence: 현재 클러스터 시퀀스
            cluster_data: 클러스터별 과거 수익률 데이터
            
        Returns:
            Tuple[str, float, float]: (시그널, 신뢰도, 예상수익률)
        """
        successful_sequences = cluster_data['successful_sequences']
        returns_by_sequence = cluster_data['returns_by_sequence']
        
        # 과거 수익률 데이터 확인
        returns = returns_by_sequence.get(current_sequence, [])
        
        if not returns:
            return "관망", 0.0, 0.0
        
        # 통계 계산
        avg_return = np.mean(returns)
        success_count = successful_sequences.get(current_sequence, 0)
        total_count = len(returns)
        success_rate = success_count / total_count if total_count > 0 else 0
        
        # 시그널 결정 로직
        if success_rate >= 0.6 and avg_return >= 3.0:
            signal = "매수"
            confidence = min(success_rate * 0.8 + (avg_return / 10) * 0.2, 0.95)
        elif success_rate <= 0.3 and avg_return <= -2.0:
            signal = "매도"
            confidence = min((1 - success_rate) * 0.8 + (abs(avg_return) / 10) * 0.2, 0.95)
        else:
            signal = "관망"
            confidence = 1.0 - abs(success_rate - 0.5) * 2
        
        return signal, confidence, avg_return

    def get_model_info(self, symbol: str) -> Optional[Dict]:
        """
        특정 심볼의 모델 정보 조회
        
        Args:
            symbol (str): 조회할 주식 심볼
            
        Returns:
            Dict: 모델 정보
        """
        if symbol not in self.models:
            return None
        
        cluster_data = self.cluster_data[symbol]
        successful_sequences = cluster_data['successful_sequences']
        
        return {
            "symbol": symbol,
            "model_type": "cluster",
            "n_clusters": self.n_clusters,
            "lookback_days": self.lookback_days,
            "forward_days": self.forward_days,
            "successful_sequences_count": len(successful_sequences),
            "total_patterns": len(cluster_data['returns_by_sequence'])
        }

    def evaluate_current_sequence(self, symbol: str) -> Dict:
        """
        현재 시퀀스에 대한 상세 평가 정보 반환
        
        Args:
            symbol (str): 평가할 주식 심볼
            
        Returns:
            Dict: 현재 시퀀스 평가 결과
        """
        if symbol not in self.models:
            raise ValueError(f"[{symbol}] 학습된 모델이 없습니다.")
        
        model_data = self.models[symbol]
        cluster_data = self.cluster_data[symbol]
        
        # 현재 시퀀스 추출
        price_cluster_df = model_data['price_cluster_df']
        current_sequence = tuple(price_cluster_df['cluster'].iloc[-self.lookback_days:].values)
        
        # 시그널 정보
        signal, confidence, expected_return = self._determine_signal(current_sequence, cluster_data)
        
        # 과거 수익률 정보
        returns = cluster_data['returns_by_sequence'].get(current_sequence, [])
        successful_sequences = cluster_data['successful_sequences']
        
        evaluation = {
            "current_sequence": current_sequence,
            "signal": signal,
            "confidence": confidence,
            "expected_return": expected_return,
            "historical_occurrences": len(returns),
            "success_count": successful_sequences.get(current_sequence, 0),
            "avg_return": np.mean(returns) if returns else 0.0,
            "median_return": np.median(returns) if returns else 0.0,
            "return_std": np.std(returns) if returns else 0.0
        }
        
        return evaluation