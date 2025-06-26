const API_BASE_URL = 'http://localhost:5000';

class StockAPIError extends Error {
    constructor(message, status) {
        super(message);
        this.name = 'StockAPIError';
        this.status = status;
    }
}

export const stockAPI = {
    // 예측 요청
    async fetchPrediction(symbol, periods = ['short', 'medium', 'long']) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/predict/${symbol}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ periods })
            });

            if (!response.ok) {
                throw new StockAPIError(`HTTP error! status: ${response.status}`, response.status);
            }

            const data = await response.json();

            if (!data.success) {
                throw new StockAPIError(data.error || 'Prediction failed');
            }

            return data.data;
        } catch (error) {
            if (error instanceof StockAPIError) {
                throw error;
            }
            console.error('API Error:', error);
            throw new StockAPIError('네트워크 연결에 실패했습니다.');
        }
    },

    // 주식 목록 조회
    async fetchAvailableStocks() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/stocks`);

            if (!response.ok) {
                throw new StockAPIError(`HTTP error! status: ${response.status}`, response.status);
            }

            const data = await response.json();

            if (!data.success) {
                throw new StockAPIError(data.error || 'Failed to fetch stocks');
            }

            return data.data;
        } catch (error) {
            if (error instanceof StockAPIError) {
                throw error;
            }
            throw new StockAPIError('주식 목록을 가져오는데 실패했습니다.');
        }
    },

    // API 상태 확인
    async checkAPIStatus() {
        try {
            const response = await fetch(`${API_BASE_URL}/`, {
                method: 'GET',
                timeout: 5000 // 5초 타임아웃
            });
            return response.ok;
        } catch (error) {
            console.error('API connection failed:', error);
            return false;
        }
    }
};