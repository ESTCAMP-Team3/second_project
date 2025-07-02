import React, { useEffect, useState } from 'react';
import { ArrowLeft, Calendar, AlertTriangle } from 'lucide-react';
import { useStockPrediction } from '../../hooks/useStockPrediction';

interface ProphetPredictionCardProps {
    prediction: {
        날짜: string;
        예측가격: number;
        하한가격: number;
        상한가격: number;
    };
    index: number;
}

interface PredictionPageProps {
    selectedStock?: {
        name: string;
        symbol: string;
    };
    onBack: () => void;
}

const ProphetPredictionCard: React.FC<ProphetPredictionCardProps> = ({ prediction, index }) => {
    const confidenceRange = prediction.상한가격 - prediction.하한가격;
    const confidencePercent = (confidenceRange / prediction.예측가격) * 100;

    return (
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Calendar size={18} className="text-blue-500" />
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
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                        ${prediction.예측가격.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">예측 가격</div>
                </div>

                <div className="flex justify-between items-center text-sm">
                    <div className="text-center">
                        <div className="font-medium text-red-500">
                            ${prediction.하한가격.toFixed(2)}
                        </div>
                        <div className="text-gray-500 text-xs">하한가</div>
                    </div>
                    <div className="text-center">
                        <div className="font-medium text-green-500">
                            ${prediction.상한가격.toFixed(2)}
                        </div>
                        <div className="text-gray-500 text-xs">상한가</div>
                    </div>
                </div>

                <div className="mt-4">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>신뢰구간</span>
                        <span>±{confidencePercent.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                        <div 
                            className="h-full bg-gradient-to-r from-red-400 via-blue-500 to-green-400 rounded-full"
                            style={{ width: `${Math.min(100, confidencePercent * 2)}%` }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

const PredictionPage: React.FC<PredictionPageProps> = ({ selectedStock, onBack }) => {
    const { prophetData, loading, error, fetchProphetPrediction } = useStockPrediction();
    const [prophetSettings] = useState({
        days: 7,
        period: '5y',
        retrain: false
    });

    useEffect(() => {
        if (selectedStock?.symbol) {
            fetchProphetPrediction(selectedStock.symbol, prophetSettings.days, prophetSettings.period, prophetSettings.retrain);
        }
    }, [selectedStock?.symbol, prophetSettings, fetchProphetPrediction]);


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
                    <div className="text-center text-lg text-gray-600 dark:text-gray-300">
                        <div className="inline-flex items-center gap-2">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                            Prophet 모델 예측 중...
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


                {/* Prophet 예측 결과 */}
                {!loading && !error && prophetData && (
                    <div className="space-y-8">
                        {/* 모델 정보 요약 */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-4 border border-blue-200/50 dark:border-blue-700/50">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                        {prophetData.model_info.training_data_points}
                                    </div>
                                    <div className="text-sm text-blue-700 dark:text-blue-300">학습 데이터</div>
                                </div>
                            </div>
                            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-4 border border-green-200/50 dark:border-green-700/50">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                        {prophetData.model_info.prediction_days}
                                    </div>
                                    <div className="text-sm text-green-700 dark:text-green-300">예측 일수</div>
                                </div>
                            </div>
                            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-4 border border-purple-200/50 dark:border-purple-700/50">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                        {prophetData.model_info.changepoints}
                                    </div>
                                    <div className="text-sm text-purple-700 dark:text-purple-300">변화점</div>
                                </div>
                            </div>
                            <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl p-4 border border-orange-200/50 dark:border-orange-700/50">
                                <div className="text-center">
                                    <div className="text-xl font-bold text-orange-600 dark:text-orange-400">
                                        {prophetData.model_info.training_period.toUpperCase()}
                                    </div>
                                    <div className="text-sm text-orange-700 dark:text-orange-300">학습 기간</div>
                                </div>
                            </div>
                        </div>

                        {/* 예측 카드들 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {prophetData.predictions.map((prediction, index) => (
                                <ProphetPredictionCard
                                    key={index}
                                    prediction={prediction}
                                    index={index}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {!loading && !error && !prophetData && (
                    <div className="text-center text-gray-600 dark:text-gray-400">Prophet 예측 데이터를 사용할 수 없습니다.</div>
                )}
            </div>
        </div>
    );
};

export default PredictionPage;

