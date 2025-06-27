import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface PredictionCardProps {
  title?: string;
  prediction: any;
  className?: string;
  period?: string;
  periodLabel?: string;
}

const PredictionCard: React.FC<PredictionCardProps> = ({ title, prediction, className = '', period, periodLabel }) => {
    if (!prediction) {
        return (
            <div className={`bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg ${className}`}>
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
                    {title || periodLabel}
                </h3>
                <div className="text-center text-gray-500 dark:text-gray-400">
                    예측 데이터를 불러오는 중...
                </div>
            </div>
        );
    }

    const probability = prediction.up_probability;
    const isPositive = probability >= 50;
    const targetPrice = prediction.target_price;
    const confidence = prediction.confidence_score;
    const expectedReturn = prediction.expected_return;

    return (
        <div className={`bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg ${className}`}>
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
                {title || periodLabel} {prediction.period_name ? `(${prediction.period_name})` : ''}
            </h3>

            <div className="text-center">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
                    isPositive ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'
                }`}>
                    {isPositive ? (
                        <TrendingUp className="text-green-600 dark:text-green-400" size={32} />
                    ) : (
                        <TrendingDown className="text-red-600 dark:text-red-400" size={32} />
                    )}
                </div>

                <div className={`text-3xl font-bold mb-2 ${
                    isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}>
                    {probability.toFixed(1)}%
                </div>

                <div className="text-gray-600 dark:text-gray-400 mb-4">
                    {isPositive ? '상승 예상' : '하락 예상'}
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
                        <div className="text-sm text-gray-600 dark:text-gray-400">목표가</div>
                        <div className="text-lg font-semibold text-gray-800 dark:text-white">
                            ${targetPrice.toFixed(2)}
                        </div>
                    </div>

                    <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
                        <div className="text-sm text-gray-600 dark:text-gray-400">신뢰도</div>
                        <div className="text-lg font-semibold text-gray-800 dark:text-white">
                            {confidence.toFixed(1)}%
                        </div>
                    </div>
                </div>

                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-sm text-gray-600 dark:text-gray-400">예상 수익률</div>
                    <div className={`text-xl font-bold ${
                        expectedReturn >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }`}>
                        {expectedReturn >= 0 ? '+' : ''}{expectedReturn.toFixed(2)}%
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PredictionCard;