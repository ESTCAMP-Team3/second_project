import React from 'react';
import StockCard from '../components/StockCard';
import { DOMESTIC_STOCKS, INTERNATIONAL_STOCKS } from '../../constants/stocks';

const SectionHeader = ({ title, icon }) => (
    <div className="flex items-center gap-2 mb-4">
        {icon}
        <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200">{title}</h2>
    </div>
);

const MainPage = ({ onStockSelect }) => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-6">
            <div className="max-w-6xl mx-auto space-y-12">

                {/* 헤더 */}
                <div className="text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center">
                        <span className="text-gray-500 dark:text-gray-300">
                            우리나라가 사랑하는{' '}
                        </span>
                        <span className="text-gray-800 dark:text-white">
                            국내주, 미국주
                        </span>
                        <br />
                        <span className="text-gray-500 dark:text-gray-300">
                            쉽고 간편하게{' '}
                        </span>
                        <span className="bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent font-extrabold">
                            예측하기
                        </span>
                    </h1>
                </div>

                {/* 국내 주식 섹션 */}
                <section>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        {DOMESTIC_STOCKS.map((stock) => (
                            <StockCard key={stock.symbol} stock={stock} onClick={onStockSelect} />
                        ))}
                    </div>
                </section>

                {/* 해외 주식 섹션 */}
                <section>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        {INTERNATIONAL_STOCKS.map((stock) => (
                            <StockCard key={stock.symbol} stock={stock} onClick={onStockSelect} />
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};;

export default MainPage;