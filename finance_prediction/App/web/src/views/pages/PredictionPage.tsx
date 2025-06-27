import React, { useState, useEffect } from 'react';
import { ArrowLeft, TrendingUp, TrendingDown, Clock, Target, BarChart3 } from 'lucide-react';
import { useStockPrediction } from '../../hooks/useStockPrediction';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import PredictionCard from '../components/PredictionCard';

interface PredictionPageProps {
  selectedStock: any;
  onBack: () => void;
}

const PredictionPage: React.FC<PredictionPageProps> = ({ selectedStock, onBack }) => {
    const { predictionData, loading, error, fetchPrediction } = useStockPrediction();
    const [selectedPeriods, setSelectedPeriods] = useState(['short', 'medium', 'long']);

    useEffect(() => {
        if (selectedStock) {
            fetchPrediction(selectedStock.symbol, selectedPeriods);
        }
    }, [selectedStock, selectedPeriods, fetchPrediction]);

    const handlePeriodToggle = (period) => {
        setSelectedPeriods(prev => {
            const newPeriods = prev.includes(period)
                ? prev.filter(p => p !== period)
                : [...prev, period];
            return newPeriods.length > 0 ? newPeriods : [period];
        });
    };

    const periodLabels = {
        short: '단기 (1-3개월)',
        medium: '중기 (3-6개월)', 
        long: '장기 (6-12개월)'
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
                <Loading message={`${selectedStock?.name} 예측 분석 중...`} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-6">
                <div className="max-w-md w-full">
                    <ErrorMessage
                        title="예측 분석 실패"
                        message={error}
                        onRetry={() => fetchPrediction(selectedStock.symbol, selectedPeriods)}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
            <div className="container mx-auto px-6 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                    >
                        <ArrowLeft size={20} />
                        <span>뒤로 가기</span>
                    </button>

                    <div className="text-center">
                        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                            {selectedStock?.name} 예측 분석
                        </h1>
                        <p className="text-gray-600 dark:text-gray-300 mt-2">
                            {selectedStock?.symbol}
                        </p>
                    </div>

                    <div className="w-24"></div>
                </div>

                {/* Period Selector */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                        <Clock size={20} />
                        예측 기간 선택
                    </h2>
                    <div className="flex flex-wrap gap-3">
                        {Object.entries(periodLabels).map(([period, label]) => (
                            <button
                                key={period}
                                onClick={() => handlePeriodToggle(period)}
                                className={`px-4 py-2 rounded-lg border-2 transition-all duration-200 ${
                                    selectedPeriods.includes(period)
                                        ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                                        : 'border-gray-300 text-gray-600 hover:border-gray-400 dark:border-gray-600 dark:text-gray-300'
                                }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Predictions */}
                {predictionData && (
                    <div className="space-y-6">
                        {/* Stock Info */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                                <BarChart3 size={20} />
                                주식 정보
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">종목명</p>
                                    <p className="text-lg font-medium text-gray-800 dark:text-white">
                                        {predictionData.stock_info?.name || selectedStock?.name}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">심볼</p>
                                    <p className="text-lg font-medium text-gray-800 dark:text-white">
                                        {predictionData.stock_info?.symbol || selectedStock?.symbol}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Prediction Results */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                            {selectedPeriods.map(period => {
                                const prediction = predictionData.predictions?.[period];
                                if (!prediction) return null;

                                return (
                                    <PredictionCard
                                        key={period}
                                        period={period}
                                        periodLabel={periodLabels[period]}
                                        prediction={prediction}
                                    />
                                );
                            })}
                        </div>

                        {/* Metadata */}
                        {predictionData.metadata && (
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                                <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                                    <Target size={20} />
                                    분석 메타데이터
                                </h2>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                    <pre className="whitespace-pre-wrap">
                                        {JSON.stringify(predictionData.metadata, null, 2)}
                                    </pre>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PredictionPage;