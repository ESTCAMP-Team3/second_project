import React from 'react';
import { PREDICTION_PERIODS } from '../../constants/stocks';

interface PeriodSelectorProps {
  selectedPeriod: string;
  onPeriodChange: (period: string) => void;
  className?: string;
}

const PeriodSelector: React.FC<PeriodSelectorProps> = ({ selectedPeriod, onPeriodChange, className = '' }) => {
    return (
        <div className={`flex justify-center ${className}`}>
            <div className="bg-white dark:bg-gray-800 rounded-full p-1 shadow-lg">
                {PREDICTION_PERIODS.map((option) => (
                    <button
                        key={option.key}
                        onClick={() => onPeriodChange(option.key)}
                        className={`px-6 py-3 rounded-full font-medium transition-all ${
                            selectedPeriod === option.key
                                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md'
                                : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white'
                        }`}
                    >
                        <div className="text-center">
                            <div>{option.label}</div>
                            <div className="text-xs opacity-75">{option.period}</div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default PeriodSelector;