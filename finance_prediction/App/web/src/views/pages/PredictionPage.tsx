import React, { useState } from 'react';
import { ArrowLeft, TrendingUp, TrendingDown } from 'lucide-react';

// 하드코딩된 예측 데이터
const mockPredictions = {
    short: {
        current: 50000,
        predicted: 55000,
        change: 10.0,
        confidence: 75,
        trend: 'up'
    },
    medium: {
        current: 50000,
        predicted: 62000,
        change: 24.0,
        confidence: 68,
        trend: 'up'
    },
    long: {
        current: 50000,
        predicted: 48000,
        change: -4.0,
        confidence: 62,
        trend: 'down'
    }
};

// 타입 정의
interface PredictionData {
    current: number;
    predicted: number;
    change: number;
    confidence: number;
    trend: string;
}

interface PredictionChartProps {
    period: 'short' | 'medium' | 'long';
    data: PredictionData;
}

interface SelectedStock {
    name: string;
    symbol: string;
}

interface PredictionPageProps {
    selectedStock?: SelectedStock;
    onBack: () => void;
}

// 차트 컴포넌트 (하드코딩)
const PredictionChart: React.FC<PredictionChartProps> = ({ period, data }) => {
    const periodLabels = {
        short: '단기 (1-3년)',
        medium: '중기 (4-7년)',
        long: '장기 (8-12년)'
    };

    const isPositive = data.change > 0;

    return (
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                    {periodLabels[period]}
                </h3>
                <div className={`flex items-center gap-1 ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                    {isPositive ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                    <span className="font-medium">{isPositive ? '+' : ''}{data.change}%</span>
                </div>
            </div>

            {/* 간단한 차트 시각화 */}
            <div className="space-y-4">
                <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">현재가</span>
                    <span className="font-medium text-gray-800 dark:text-white">
            {data.current.toLocaleString()}원
          </span>
                </div>

                <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">예상가</span>
                    <span className={`font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {data.predicted.toLocaleString()}원
          </span>
                </div>

                {/* 프로그레스 바 형태의 간단한 차트 */}
                <div className="space-y-2">
                    <div className="flex justify-between text-xs text-gray-500">
                        <span>신뢰도</span>
                        <span>{data.confidence}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                            className={`h-2 rounded-full ${
                                data.confidence > 70 ? 'bg-green-500' :
                                    data.confidence > 50 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${data.confidence}%` }}
                        ></div>
                    </div>
                </div>

                {/* 간단한 가격 추세 라인 */}
                <div className="mt-4 h-20 relative">
                    <svg className="w-full h-full" viewBox="0 0 100 50">
                        <defs>
                            <linearGradient id={`gradient-${period}`} x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity="0.3"/>
                                <stop offset="100%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity="0.05"/>
                            </linearGradient>
                        </defs>

                        {/* 추세선 */}
                        <path
                            d={`M 10 ${isPositive ? 35 : 15} Q 50 25 90 ${isPositive ? 15 : 35}`}
                            stroke={isPositive ? "#10b981" : "#ef4444"}
                            strokeWidth="2"
                            fill="none"
                        />

                        {/* 영역 채우기 */}
                        <path
                            d={`M 10 ${isPositive ? 35 : 15} Q 50 25 90 ${isPositive ? 15 : 35} L 90 45 L 10 45 Z`}
                            fill={`url(#gradient-${period})`}
                        />

                        {/* 시작점 */}
                        <circle cx="10" cy={isPositive ? 35 : 15} r="2" fill={isPositive ? "#10b981" : "#ef4444"} />
                        {/* 끝점 */}
                        <circle cx="90" cy={isPositive ? 15 : 35} r="2" fill={isPositive ? "#10b981" : "#ef4444"} />
                    </svg>
                </div>
            </div>
        </div>
    );
};

const PredictionPage: React.FC<PredictionPageProps> = ({ selectedStock, onBack }) => {
    const [isSuccess] = useState(true); // 성공/실패 상태 (하드코딩)

    return (
        <div className="min-h-screen relative">
            {/* 배경 */}
            <div className="absolute inset-0 bg-white dark:bg-black"></div>

            {/* 메인 콘텐츠 */}
            <div className="relative z-10 min-h-screen">
                <div className="w-full max-w-7xl mx-auto px-6 md:px-12 lg:px-16">
                    {/* 헤더 */}
                    <div className="flex items-center mb-12">
                        <button
                            onClick={onBack}
                            className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors duration-200"
                        >
                            <ArrowLeft size={20} />
                            <span>뒤로 가기</span>
                        </button>
                    </div>

                    {/* 회사 정보 */}
                    <div className="text-center mb-8">
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white mb-2">
                            {selectedStock?.name || "삼성전자"}
                        </h1>
                        <p className="text-xl text-gray-600 dark:text-gray-400">
                            {selectedStock?.symbol || "005930"}
                        </p>
                    </div>

                    {/* 상태 메시지 */}
                    <div className="text-center mb-12">
                        {isSuccess ? (
                            <div className="inline-flex items-center gap-2 px-6 py-3 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full">
                                <TrendingUp size={20} />
                                <span className="text-lg font-medium">예측 결과입니다</span>
                            </div>
                        ) : (
                            <div className="inline-flex items-center gap-2 px-6 py-3 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-full">
                                <TrendingDown size={20} />
                                <span className="text-lg font-medium">예측 분석에 실패했습니다</span>
                            </div>
                        )}
                    </div>

                    {/* 예측 차트들 */}
                    {isSuccess && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <PredictionChart period="short" data={mockPredictions.short} />
                            <PredictionChart period="medium" data={mockPredictions.medium} />
                            <PredictionChart period="long" data={mockPredictions.long} />
                        </div>
                    )}

                    {/* 실패 시 재시도 버튼 */}
                    {!isSuccess && (
                        <div className="text-center">
                            <button className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200">
                                다시 시도
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PredictionPage;

