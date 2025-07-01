import React, { useEffect } from 'react';
import { ArrowLeft, TrendingUp, TrendingDown } from 'lucide-react';
import { useStockPrediction } from '../../hooks/useStockPrediction';

interface PredictionChartProps {
    day: number;
    current: number;
    predicted: number;
}

interface PredictionPageProps {
    selectedStock?: {
        name: string;
        symbol: string;
    };
    onBack: () => void;
}

const PredictionChart: React.FC<PredictionChartProps> = ({ day, current, predicted }) => {
    const change = predicted - current;
    const changeRate = current !== 0 ? (change / current) * 100 : 0;
    const isPositive = change > 0;

    return (
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                    {day}일 후 예측
                </h3>
                <div className={`flex items-center gap-1 ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                    {isPositive ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                    <span className="font-medium">{isPositive ? '+' : ''}{changeRate.toFixed(2)}%</span>
                </div>
            </div>

            <div className="space-y-4 text-sm">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>현재가</span>
                    <span className="font-medium text-gray-800 dark:text-white">
            {current.toLocaleString()}원
          </span>
                </div>

                <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">예상가</span>
                    <span className={`font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {predicted.toLocaleString()}원
          </span>
                </div>
            </div>
        </div>
    );
};

const PredictionPage: React.FC<PredictionPageProps> = ({ selectedStock, onBack }) => {
    const { predictionData, loading, error, fetchPrediction } = useStockPrediction();

    useEffect(() => {
        if (selectedStock?.symbol) {
            fetchPrediction(selectedStock.symbol, 5);
        }
    }, [selectedStock?.symbol, fetchPrediction]);

    const currentPrice = predictionData?.['1']?.values[0] ?? null;

    if (!selectedStock) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p>종목을 선택해주세요.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen relative flex flex-col items-center justify-start">
            {/* 백그라운드 임시 제거 */}
            {/* <div className="absolute inset-0 bg-white dark:bg-black" /> */}

            <div className="relative z-10 min-h-screen w-full max-w-7xl mx-auto px-6 md:px-12 lg:px-16">
                <div className="flex items-center mb-12 pt-10">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400"
                    >
                        <ArrowLeft size={20} />
                        <span>뒤로 가기</span>
                    </button>
                </div>

                <div className="text-center mb-8">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white mb-2">
                        {selectedStock.name}
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-400">{selectedStock.symbol}</p>
                </div>

                {loading && (
                    <div className="text-center text-lg text-gray-600">예측 데이터를 불러오는 중...</div>
                )}

                {error && (
                    <div className="text-center text-red-600">오류: {error}</div>
                )}

                {!loading && !error && predictionData && currentPrice !== null && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3, 4, 5].map(day => (
                            <PredictionChart
                                key={day}
                                day={day}
                                current={currentPrice}
                                predicted={predictionData[String(day)]?.values[0] ?? currentPrice}
                            />
                        ))}
                    </div>
                )}

                {!loading && !error && !predictionData && (
                    <div className="text-center text-gray-600">예측 데이터를 사용할 수 없습니다.</div>
                )}
            </div>
        </div>
    );
};

export default PredictionPage;

