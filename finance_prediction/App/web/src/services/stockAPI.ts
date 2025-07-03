const BASE_URL = 'http://localhost:5001';

export interface PredictionData {
    [period: string]: {
        dates: string[];
        values: number[];
    };
}

export interface ProphetPredictionData {
    success: boolean;
    symbol: string;
    predictions: {
        날짜: string;
        예측가격: number;
        하한가격: number;
        상한가격: number;
    }[];
    model_info: {
        training_period: string;
        training_data_points: number;
        prediction_days: number;
        changepoints: number;
        seasonalities: string[];
    };
    timestamp: string;
}

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
    symbol: string;
    predictions: {
        date: string;
        cluster: number;
        entry_signal: number;
        close: number; // 추가
        signal_description: string;
    }[];
    summary: {
        total_days: number;
        entry_signals: number;
        signal_ratio: number;
    };
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
    type: 'domestic' | 'international'; // 수정: market → type
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

    async fetchPrediction(
        symbol: string,
        days: number = 5
    ): Promise<PredictionData> {
        try {
            const response = await fetch(`${BASE_URL}/api/predict/${symbol}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ days }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: {
                success: boolean;
                data: PredictionData;
                error?: string;
            } = await response.json();

            if (data.success) {
                return data.data;
            } else {
                throw new Error(data.error || '예측 데이터를 불러올 수 없습니다.');
            }
        } catch (error) {
            console.error('Failed to fetch prediction:', error);
            throw error;
        }
    },

    async trainModel(symbol: string): Promise<TrainModelResponse> {
        try {
            const response = await fetch(`${BASE_URL}/api/train/${symbol}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: TrainModelResponse = await response.json();

            if (data.success) {
                return data;
            } else {
                throw new Error(data.error || '모델 훈련에 실패했습니다.');
            }
        } catch (error) {
            console.error('Failed to train model:', error);
            throw error;
        }
    },

    async fetchClusterPrediction(
        symbol: string,
        days: number = 10
    ): Promise<ClusterPredictionData> {
        try {
            const response = await fetch(`${BASE_URL}/api/cluster/predict/${symbol}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ days }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: {
                success: boolean;
                data: ClusterPredictionData;
                error?: string;
            } = await response.json();

            if (data.success) {
                return data.data;
            } else {
                throw new Error(data.error || '클러스터 예측 데이터를 불러올 수 없습니다.');
            }
        } catch (error) {
            console.error('Failed to fetch cluster prediction:', error);
            throw error;
        }
    },

    async trainClusterModel(symbol: string): Promise<TrainModelResponse> {
        try {
            const response = await fetch(`${BASE_URL}/api/cluster/train/${symbol}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
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

    async fetchProphetPrediction(
        symbol: string,
        days: number = 5,
        period: string = '1y',
        retrain: boolean = false
    ): Promise<ProphetPredictionData> {
        try {
            const response = await fetch(`${BASE_URL}/api/predict/${symbol}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ days, period, retrain }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: ProphetPredictionData = await response.json();

            if (data.success) {
                return data;
            } else {
                throw new Error('Prophet 예측 데이터를 불러올 수 없습니다.');
            }
        } catch (error) {
            console.error('Failed to fetch prophet prediction:', error);
            throw error;
        }
    },

    async fetchLSTMPrediction(
        symbol: string,
        days: number = 5,
        period: string = '1y',
        retrain: boolean = false
    ): Promise<LSTMPredictionData> {
        try {
            const response = await fetch(`${BASE_URL}/api/lstm/predict/${symbol}`, {
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
                throw new Error('LSTM 예측 데이터를 불러올 수 없습니다.');
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
};