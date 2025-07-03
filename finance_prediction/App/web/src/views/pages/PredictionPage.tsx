import React, { useEffect, useState } from 'react';
import { ArrowLeft, Calendar, AlertTriangle } from 'lucide-react';
import { useStockPrediction } from '../../hooks/useStockPrediction';

interface LSTMPredictionCardProps {
    prediction: {
        날짜: string;
        예측가격: number;
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

const LSTMPredictionCard: React.FC<LSTMPredictionCardProps> = ({ prediction, index }) => {
    return (
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Calendar size={18} className="text-purple-500" />
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
                    <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                        ${prediction.예측가격.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">LSTM 예측 가격</div>
                </div>

                <div className="mt-4">
                    <div className="w-full bg-gradient-to-r from-purple-100 to-purple-200 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-2 text-center">
                        <div className="text-xs text-purple-700 dark:text-purple-300 font-medium">
                            딥러닝 기반 예측
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const PredictionPage: React.FC<PredictionPageProps> = ({ selectedStock, onBack }) => {
    const { lstmData, loading, error, fetchLSTMPrediction } = useStockPrediction();
    const [lstmSettings] = useState({
        days: 7,
        period: '1y',
        retrain: false
    });

    useEffect(() => {
        if (selectedStock?.symbol) {
            fetchLSTMPrediction(selectedStock.symbol, lstmSettings.days, lstmSettings.period, lstmSettings.retrain);
        }
    }, [selectedStock?.symbol, lstmSettings, fetchLSTMPrediction]);


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
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
                            LSTM 모델 예측 중...
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


                {/* LSTM 예측 결과 */}
                {!loading && !error && lstmData && (
                    <div className="space-y-8">
                        {/* 모델 정보 요약 */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-4 border border-purple-200/50 dark:border-purple-700/50">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                        {lstmData.model_info.training_data_points}
                                    </div>
                                    <div className="text-sm text-purple-700 dark:text-purple-300">학습 데이터</div>
                                </div>
                            </div>
                            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-4 border border-blue-200/50 dark:border-blue-700/50">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                        {lstmData.model_info.prediction_days}
                                    </div>
                                    <div className="text-sm text-blue-700 dark:text-blue-300">예측 일수</div>
                                </div>
                            </div>
                            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-4 border border-green-200/50 dark:border-green-700/50">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                        {lstmData.model_info.window_size}
                                    </div>
                                    <div className="text-sm text-green-700 dark:text-green-300">윈도우 크기</div>
                                </div>
                            </div>
                            <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl p-4 border border-orange-200/50 dark:border-orange-700/50">
                                <div className="text-center">
                                    <div className="text-xl font-bold text-orange-600 dark:text-orange-400">
                                        {lstmData.model_info.training_period.toUpperCase()}
                                    </div>
                                    <div className="text-sm text-orange-700 dark:text-orange-300">학습 기간</div>
                                </div>
                            </div>
                        </div>

                        {/* LSTM 모델 세부 정보 */}
                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20 rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">LSTM 모델 구성</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="text-center">
                                    <div className="text-xl font-bold text-gray-700 dark:text-gray-300">
                                        {lstmData.model_info.lstm_units}
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">LSTM 유닛</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-xl font-bold text-gray-700 dark:text-gray-300">
                                        {(lstmData.model_info.dropout_rate * 100).toFixed(0)}%
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">드롭아웃</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-xl font-bold text-gray-700 dark:text-gray-300">
                                        {lstmData.model_info.top_features.length}
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">선택된 특성</div>
                                </div>
                            </div>
                            <div className="mt-4">
                                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">주요 특성:</div>
                                <div className="flex flex-wrap gap-2">
                                    {lstmData.model_info.top_features.map((feature, index) => (
                                        <span key={index} className="px-2 py-1 bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-md text-xs">
                                            {feature}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* 예측 카드들 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {lstmData.predictions.map((prediction, index) => (
                                <LSTMPredictionCard
                                    key={index}
                                    prediction={prediction}
                                    index={index}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {!loading && !error && !lstmData && (
                    <div className="text-center text-gray-600 dark:text-gray-400">LSTM 예측 데이터를 사용할 수 없습니다.</div>
                )}
            </div>
        </div>
    );
};

export default PredictionPage;

