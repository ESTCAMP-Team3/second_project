
import React, { useEffect, useState } from 'react';
import { ArrowLeft, Calendar, AlertTriangle, Target, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useStockPrediction } from '../../hooks/useStockPrediction';

interface LSTMPredictionCardProps {
    prediction: {
        날짜: string;
        예측가격: number;
    };
    index: number;
    basePrice: number;
}

interface ClusterPredictionCardProps {
    signal: '매수' | '매도' | '관망';
    confidence: number;
    expected_return: number;
}

interface PredictionPageProps {
    selectedStock?: {
        name: string;
        symbol: string;
    };
    onBack: () => void;
}

const LSTMPredictionCard: React.FC<LSTMPredictionCardProps> = ({ prediction, index, basePrice }) => {
    const priceChange = prediction.예측가격 - basePrice;
    const priceChangePercent = (priceChange / basePrice) * 100;
    const isPositive = priceChange > 0;
    const isNegative = priceChange < 0;

    const getPriceColor = () => {
        if (isPositive) return 'text-green-600 dark:text-green-400';
        if (isNegative) return 'text-red-600 dark:text-red-400';
        return 'text-gray-600 dark:text-gray-400';
    };

    const getIconColor = () => {
        if (isPositive) return 'text-green-500';
        if (isNegative) return 'text-red-500';
        return 'text-gray-500';
    };

    const getGradientColor = () => {
        if (isPositive) return 'from-green-100 to-green-200 dark:from-green-900/20 dark:to-green-800/20';
        if (isNegative) return 'from-red-100 to-red-200 dark:from-red-900/20 dark:to-red-800/20';
        return 'from-gray-100 to-gray-200 dark:from-gray-900/20 dark:to-gray-800/20';
    };

    const getTextColor = () => {
        if (isPositive) return 'text-green-700 dark:text-green-300';
        if (isNegative) return 'text-red-700 dark:text-red-300';
        return 'text-gray-700 dark:text-gray-300';
    };

    return (
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Calendar size={18} className={getIconColor()} />
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                        Day {index + 1}
                    </h3>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(prediction.날짜).toLocaleDateString('ko-KR')}
                </div>
            </div>

            <div className="space-y-4">
                <div className="text-center">
                    <div className={`text-3xl font-bold mb-1 ${getPriceColor()}`}>
                        ${prediction.예측가격.toFixed(2)}
                    </div>
                    <div className={`text-sm mb-2 ${getPriceColor()}`}>
                        {isPositive ? '+' : ''}{priceChange.toFixed(2)} ({isPositive ? '+' : ''}{priceChangePercent.toFixed(1)}%)
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">LSTM 예측 가격</div>
                </div>

                <div className="mt-4">
                    <div className={`w-full bg-gradient-to-r ${getGradientColor()} rounded-lg p-2 text-center`}>
                        <div className={`text-xs font-medium ${getTextColor()}`}>
                            딥러닝 기반 예측
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ClusterPredictionCard: React.FC<ClusterPredictionCardProps> = ({ signal, confidence, expected_return }) => {
    const getSignalColor = (signal: string) => {
        switch (signal) {
            case '매수':
                return 'text-green-600 dark:text-green-400';
            case '매도':
                return 'text-red-600 dark:text-red-400';
            case '관망':
                return 'text-yellow-600 dark:text-yellow-400';
            default:
                return 'text-gray-600 dark:text-gray-400';
        }
    };

    const getSignalBgColor = (signal: string) => {
        switch (signal) {
            case '매수':
                return 'from-green-100 to-green-200 dark:from-green-900/20 dark:to-green-800/20';
            case '매도':
                return 'from-red-100 to-red-200 dark:from-red-900/20 dark:to-red-800/20';
            case '관망':
                return 'from-yellow-100 to-yellow-200 dark:from-yellow-900/20 dark:to-yellow-800/20';
            default:
                return 'from-gray-100 to-gray-200 dark:from-gray-900/20 dark:to-gray-800/20';
        }
    };

    const getSignalIcon = (signal: string) => {
        switch (signal) {
            case '매수':
                return <TrendingUp size={18} className="text-green-500" />;
            case '매도':
                return <TrendingDown size={18} className="text-red-500" />;
            case '관망':
                return <Minus size={18} className="text-yellow-500" />;
            default:
                return <Target size={18} className="text-gray-500" />;
        }
    };

    return (
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    {getSignalIcon(signal)}
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                        진입점 분석
                    </h3>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date().toLocaleDateString('ko-KR')}
                </div>
            </div>

            <div className="space-y-4">
                <div className="text-center">
                    <div className={`text-3xl font-bold mb-1 ${getSignalColor(signal)}`}>
                        {signal}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">클러스터 시그널</div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="text-center">
                        <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                            {(confidence * 100).toFixed(1)}%
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">신뢰도</div>
                    </div>
                    <div className="text-center">
                        <div className={`text-lg font-semibold ${expected_return >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {expected_return >= 0 ? '+' : ''}{expected_return.toFixed(1)}%
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">예상수익률</div>
                    </div>
                </div>

                <div className="mt-4">
                    <div className={`w-full bg-gradient-to-r ${getSignalBgColor(signal)} rounded-lg p-2 text-center`}>
                        <div className="text-xs text-gray-700 dark:text-gray-300 font-medium">
                            패턴 기반 예측
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const PredictionPage: React.FC<PredictionPageProps> = ({ selectedStock, onBack }) => {
    const {
        lstmData,
        clusterData,
        clusterSequenceAnalysis,
        currentPrice,
        loading,
        error,
        fetchLSTMPrediction,
        fetchClusterPrediction,
        fetchClusterSequenceAnalysis,
        fetchCurrentPrice
    } = useStockPrediction();

    const [lstmSettings] = useState({
        days: 7,
        period: '1y',
        retrain: false
    });

    const [clusterSettings] = useState({
        period: '5y',
        retrain: false
    });


    useEffect(() => {
        if (selectedStock?.symbol) {
            fetchCurrentPrice(selectedStock.symbol);
            fetchLSTMPrediction(selectedStock.symbol, lstmSettings.days, lstmSettings.period, lstmSettings.retrain);
            fetchClusterPrediction(selectedStock.symbol, clusterSettings.period, clusterSettings.retrain);
        }
    }, [selectedStock?.symbol, lstmSettings, clusterSettings, fetchLSTMPrediction, fetchClusterPrediction, fetchCurrentPrice]);

    if (!selectedStock) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p>종목을 선택해주세요.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen relative flex flex-col items-center justify-start">
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
                    <div className="text-center text-lg text-gray-600 dark:text-gray-300">
                        <div className="inline-flex items-center gap-2">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
                            모델 예측 중...
                        </div>
                    </div>
                )}

                {error && (
                    <div className="text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
                            <AlertTriangle size={18} />
                            오류: {error}
                        </div>
                    </div>
                )}

                {/* 클러스터 예측 결과 */}
                {!loading && !error && clusterData && (
                    <div className="space-y-8 mb-16">

                        {/* 클러스터 모델 정보 요약 */}
                        {clusterData.model_info && (
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-4 border border-blue-200/50 dark:border-blue-700/50">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                            {clusterData.model_info.training_data_points}
                                        </div>
                                        <div className="text-sm text-blue-700 dark:text-blue-300">학습 데이터</div>
                                    </div>
                                </div>
                                <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-4 border border-green-200/50 dark:border-green-700/50">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                            {clusterData.model_info.n_clusters}
                                        </div>
                                        <div className="text-sm text-green-700 dark:text-green-300">클러스터 수</div>
                                    </div>
                                </div>
                                <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-4 border border-purple-200/50 dark:border-purple-700/50">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                            {clusterData.model_info.window_size}
                                        </div>
                                        <div className="text-sm text-purple-700 dark:text-purple-300">윈도우 크기</div>
                                    </div>
                                </div>
                                <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl p-4 border border-orange-200/50 dark:border-orange-700/50">
                                    <div className="text-center">
                                        <div className="text-xl font-bold text-orange-600 dark:text-orange-400">
                                            {clusterData.model_info.training_period.toUpperCase()}
                                        </div>
                                        <div className="text-sm text-orange-700 dark:text-orange-300">학습 기간</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 클러스터 모델 세부 정보 */}
                        {clusterData.model_info && (
                            <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20 rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50 mb-8">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="text-center">
                                        <div className="text-xl font-bold text-gray-700 dark:text-gray-300">
                                            {clusterData.model_info.scaler_type}
                                        </div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400">스케일러</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-xl font-bold text-gray-700 dark:text-gray-300">
                                            {clusterData.model_info.algorithm}
                                        </div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400">알고리즘</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-xl font-bold text-gray-700 dark:text-gray-300">
                                            {clusterData.model_info.top_features.length}
                                        </div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400">선택된 특성</div>
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">주요 특성:</div>
                                    <div className="flex flex-wrap gap-2">
                                        {clusterData.model_info.top_features.map((feature, index) => (
                                            <span key={index} className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-md text-xs">
                                                {feature}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {/* 클러스터 진입점 분석 */}
                        <div className="max-w-md mx-auto">
                            <ClusterPredictionCard
                                signal={clusterData.signal}
                                confidence={clusterData.confidence}
                                expected_return={clusterData.expected_return}
                            />
                        </div>
                    </div>
                )}

                {/* LSTM 예측 결과 */}
                {!loading && !error && lstmData && currentPrice && (
                    <div className="space-y-8">
                        {/* 예측 카드들 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {lstmData.predictions.map((prediction, index) => (
                                <LSTMPredictionCard
                                    key={index}
                                    prediction={prediction}
                                    index={index}
                                    basePrice={currentPrice}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {!loading && !error && !lstmData && (
                    <div className="text-center text-gray-600 dark:text-gray-400 mb-8">LSTM 예측 데이터를 사용할 수 없습니다.</div>
                )}

                {!loading && !error && !clusterData && (
                    <div className="text-center text-gray-600 dark:text-gray-400 mb-8">클러스터 예측 데이터를 사용할 수 없습니다.</div>
                )}
            </div>
        </div>
    );
};

export default PredictionPage;

