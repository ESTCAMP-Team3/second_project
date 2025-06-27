import React from 'react';

interface StockCardProps {
    stock: any;
    onClick: (stock: any) => void;
    index: number; // index prop 추가
    className?: string;
}

const StockCard: React.FC<StockCardProps> = ({ stock, onClick, index }) => {
    return (
        <div
            className="mb-2 opacity-0 animate-fade-in-up"
            style={{ animationDelay: `${0.5 + index * 0.1}s` }}
        >
            <div
                className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 cursor-pointer rounded-lg shadow-sm border border-gray-200/50 dark:border-gray-700/50 group"
                onClick={() => onClick(stock)}
            >
                <div className="grid grid-cols-4 gap-4 px-6 py-4 items-center">
                    <div className="text-left">
                        <div className="text-base font-semibold text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                            {stock.name}
                        </div>
                    </div>
                    <div className="text-left">
                        <div className="text-sm text-gray-600 dark:text-gray-300 font-mono group-hover:text-green-500 dark:group-hover:text-green-300 transition-colors">
                            {stock.symbol}
                        </div>
                    </div>
                    <div>
                        {/* 빈 공간 */}
                    </div>
                    <div className="text-right">
                        <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide group-hover:text-green-400 dark:group-hover:text-green-300 transition-colors">
                            {stock.market}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StockCard;