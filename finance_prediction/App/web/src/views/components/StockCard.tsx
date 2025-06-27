import React from 'react';

interface StockCardProps {
  stock: any;
  onClick: (stock: any) => void;
  className?: string;
}

const StockCard: React.FC<StockCardProps> = ({ stock, onClick, className = '' }) => {
    return (
        <button
            onClick={() => onClick(stock)}
            className={`bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-md hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 text-center group w-full ${className}`}
            aria-label={`${stock.name} (${stock.symbol})`}
        >
            {/* 종목명 */}
            <div className="text-base font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {stock.name}
            </div>

            {/* 심볼 */}
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 tracking-wide">
                {stock.symbol}
            </div>

            {/* 마켓 정보 (옵션) */}
            {stock.market && (
                <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                    {stock.market}
                </div>
            )}
        </button>
    );
};

export default StockCard;