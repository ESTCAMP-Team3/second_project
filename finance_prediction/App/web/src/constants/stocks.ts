
export interface Stock {
    symbol: string;
    name: string;
    market: string;
}

export interface PredictionPeriod {
    key: 'short' | 'medium' | 'long';
    label: string;
    period: string;
    description: string;
}

// 국내 주식
export const DOMESTIC_STOCKS: Stock[] = [
    { symbol: '005930.KS', name: '삼성전자', market: 'KRX' },
    { symbol: '000660.KS', name: 'SK하이닉스', market: 'KRX' },
    { symbol: '005380.KS', name: '현대차', market: 'KRX' },
    { symbol: '035420.KS', name: '네이버', market: 'KRX' },
    { symbol: '035720.KS', name: '카카오', market: 'KRX' },
    { symbol: '373220.KS', name: 'LG에너지솔루션', market: 'KRX' },
    { symbol: '006400.KS', name: '삼성SDI', market: 'KRX' },
    { symbol: '005490.KS', name: 'POSCO홀딩스', market: 'KRX' },
    { symbol: '105560.KS', name: 'KB금융', market: 'KRX' },
    { symbol: '068270.KS', name: '셀트리온', market: 'KRX' }
];

// 해외 주식
export const INTERNATIONAL_STOCKS: Stock[] = [
    { symbol: 'TSLA', name: 'Tesla', market: 'NASDAQ' },
    { symbol: 'AAPL', name: 'Apple', market: 'NASDAQ' },
    { symbol: 'NVDA', name: 'Nvidia', market: 'NASDAQ' },
    { symbol: 'MSFT', name: 'Microsoft', market: 'NASDAQ' },
    { symbol: 'AMZN', name: 'Amazon', market: 'NASDAQ' },
    { symbol: 'AMD', name: 'Advanced Micro Devices', market: 'NASDAQ' },
    { symbol: 'META', name: 'Meta Platforms', market: 'NASDAQ' },
    { symbol: 'GOOGL', name: 'Alphabet', market: 'NASDAQ' },
    { symbol: 'SPY', name: 'SPDR S&P 500 ETF', market: 'NYSE' },
    { symbol: 'QQQ', name: 'Invesco QQQ Trust', market: 'NASDAQ' }
];

// 예측 기간
export const PREDICTION_PERIODS: PredictionPeriod[] = [
    { key: 'short', label: '단기', period: '7일', description: '1주일 예측' },
    { key: 'medium', label: '중기', period: '30일', description: '1개월 예측' },
    { key: 'long', label: '장기', period: '90일', description: '3개월 예측' }
];

// 시장 타입
export const MARKET_TYPES = {
    DOMESTIC: 'domestic',
    INTERNATIONAL: 'international'
} as const;

export type MarketType = typeof MARKET_TYPES[keyof typeof MARKET_TYPES];

// API 설정
export const API_CONFIG = {
    BASE_URL: 'http://localhost:5000',
    TIMEOUT: 30000, // 30초
    RETRY_COUNT: 3
};