const BASE_URL = 'http://localhost:5001';

export type Period = 'short' | 'medium' | 'long';

export interface PredictionData {
    [period: string]: {
        dates: string[];
        values: number[];
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
    market: string;
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
        periods: Period[] = ['short', 'medium', 'long']
    ): Promise<PredictionData> {
        try {
            const response = await fetch(`${BASE_URL}/api/predict/${symbol}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ periods }),
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
};