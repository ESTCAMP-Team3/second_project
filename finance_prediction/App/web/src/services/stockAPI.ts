const BASE_URL = 'http://localhost:5001';

export interface LSTMPredictionData {
    success: boolean;
    symbol: string;
    predictions: {
        날짜: string;
        예측가격: number;
    }[];
    model_info: {
        model_type: string;
        training_period: string;
        training_data_points: number;
        prediction_days: number;
        top_features: string[];
        window_size: number;
        lstm_units: number;
        dropout_rate: number;
    };
    timestamp: string;
}

export interface ClusterPredictionData {
    success: boolean;
    symbol: string;
    signal: '매수' | '매도' | '관망';
    confidence: number;
    expected_return: number;
    timestamp: string;
}

export interface ClusterModelInfo {
    success: boolean;
    symbol: string;
    model_info: {
        symbol: string;
        model_type: string;
        n_clusters: number;
        lookback_days: number;
        forward_days: number;
        successful_sequences_count: number;
        total_patterns: number;
    };
    timestamp: string;
}

export interface ClusterSequenceAnalysis {
    success: boolean;
    symbol: string;
    sequence_analysis: {
        current_sequence: number[];
        signal: '매수' | '매도' | '관망';
        confidence: number;
        expected_return: number;
        historical_occurrences: number;
        success_count: number;
        avg_return: number;
        median_return: number;
        return_std: number;
    };
    timestamp: string;
}

export interface TrainModelResponse {
    success: boolean;
    message?: string;
    data?: {
        model_id?: string;
        training_time?: number;
        accuracy?: number;
        [key: string]: unknown;
    };
    error?: string;
}

export interface StockItem {
    symbol: string;
    name: string;
    type: 'domestic' | 'international';
}

export const stockAPI = {
    async checkAPIStatus(): Promise<boolean> {
        try {
            const response = await fetch(`${BASE_URL}/`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data: { status: string } = await response.json();
            return data.status === 'success';
        } catch (error) {
            console.error('API status check failed:', error);
            return false;
        }
    },

    async getCurrentPrice(symbol: string): Promise<number> {
        try {
            const response = await fetch(`${BASE_URL}/api/current-price/${symbol}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data: { success: boolean; price: number; error?: string } = await response.json();
            if (data.success) {
                return data.price;
            } else {
                throw new Error(data.error || '현재 주가를 가져올 수 없습니다.');
            }
        } catch (error) {
            console.error('Failed to fetch current price:', error);
            throw error;
        }
    },

    async getAvailableStocks(): Promise<StockItem[]> {
        try {
            const response = await fetch(`${BASE_URL}/api/stocks`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: {
                status: boolean;
                data: StockItem[];
                error?: string;
            } = await response.json();

            if (data.status) {
                return data.data;
            } else {
                throw new Error(data.error || '주식 리스트를 불러올 수 없습니다.');
            }
        } catch (error) {
            console.error('Failed to fetch stocks:', error);
            throw error;
        }
    },

    // LSTM 모델 관련 함수들
    async fetchLSTMPrediction(
        symbol: string,
        days: number = 5,
        period: string = '1y',
        retrain: boolean = false
    ): Promise<LSTMPredictionData> {
        try {
            const response = await fetch(`${BASE_URL}/api/lstm/${symbol}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ days, period, retrain }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: LSTMPredictionData = await response.json();

            if (data.success) {
                return data;
            } else {
                throw new Error(data.error || 'LSTM 예측 데이터를 불러올 수 없습니다.');
            }
        } catch (error) {
            console.error('Failed to fetch LSTM prediction:', error);
            throw error;
        }
    },

    async trainLSTMModel(
        symbol: string,
        period: string = '1y',
        force_retrain: boolean = false
    ): Promise<TrainModelResponse> {
        try {
            const response = await fetch(`${BASE_URL}/api/lstm/train/${symbol}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ period, force_retrain }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: TrainModelResponse = await response.json();

            if (data.success) {
                return data;
            } else {
                throw new Error(data.error || 'LSTM 모델 훈련에 실패했습니다.');
            }
        } catch (error) {
            console.error('Failed to train LSTM model:', error);
            throw error;
        }
    },

    // 클러스터 모델 관련 함수들
    async fetchClusterPrediction(
        symbol: string,
        period: string = '5y',
        retrain: boolean = false
    ): Promise<ClusterPredictionData> {
        try {
            const response = await fetch(`${BASE_URL}/api/cluster/${symbol}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ period, retrain }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: ClusterPredictionData = await response.json();

            if (data.success) {
                return data;
            } else {
                throw new Error(data.error || '클러스터 예측 데이터를 불러올 수 없습니다.');
            }
        } catch (error) {
            console.error('Failed to fetch cluster prediction:', error);
            throw error;
        }
    },

    async getClusterModelInfo(symbol: string): Promise<ClusterModelInfo> {
        try {
            const response = await fetch(`${BASE_URL}/api/cluster/${symbol}/info`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: ClusterModelInfo = await response.json();

            if (data.success) {
                return data;
            } else {
                throw new Error(data.error || '클러스터 모델 정보를 불러올 수 없습니다.');
            }
        } catch (error) {
            console.error('Failed to fetch cluster model info:', error);
            throw error;
        }
    },

    async getClusterSequenceAnalysis(symbol: string): Promise<ClusterSequenceAnalysis> {
        try {
            const response = await fetch(`${BASE_URL}/api/cluster/${symbol}/sequence`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: ClusterSequenceAnalysis = await response.json();

            if (data.success) {
                return data;
            } else {
                throw new Error(data.error || '클러스터 시퀀스 분석을 불러올 수 없습니다.');
            }
        } catch (error) {
            console.error('Failed to fetch cluster sequence analysis:', error);
            throw error;
        }
    },

    async trainClusterModel(
        symbol: string,
        period: string = '5y',
        force_retrain: boolean = false
    ): Promise<TrainModelResponse> {
        try {
            const response = await fetch(`${BASE_URL}/api/cluster/${symbol}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    period,
                    retrain: force_retrain
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: TrainModelResponse = await response.json();

            if (data.success) {
                return data;
            } else {
                throw new Error(data.error || '클러스터 모델 훈련에 실패했습니다.');
            }
        } catch (error) {
            console.error('Failed to train cluster model:', error);
            throw error;
        }
    },

    async clearClusterCache(): Promise<{ success: boolean; message?: string; error?: string }> {
        try {
            const response = await fetch(`${BASE_URL}/api/cluster/cache/clear`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: { success: boolean; message?: string; error?: string } = await response.json();

            if (data.success) {
                return data;
            } else {
                throw new Error(data.error || '클러스터 캐시 초기화에 실패했습니다.');
            }
        } catch (error) {
            console.error('Failed to clear cluster cache:', error);
            throw error;
        }
    },
};