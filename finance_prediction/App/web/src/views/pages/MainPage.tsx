import React from 'react';
import StockCard from '../components/StockCard';
import { DOMESTIC_STOCKS, INTERNATIONAL_STOCKS } from '../../constants/stocks';

interface MainPageProps {
  onStockSelect: (stock: any) => void;
}

const MainPage: React.FC<MainPageProps> = ({ onStockSelect }) => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-6">
            <div className="max-w-6xl mx-auto space-y-12">

                <div className="bg-red-500 text-white p-4 mb-4">
                    Tailwind 테스트 - 이 박스가 빨간색이면 Tailwind가 작동중입니다
                </div>

                {/* 헤더 */}
                <div className="text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center text-green-500">
                        우리나라가 사랑하는 국내주, 미국주
                        <br />
                        쉽고 간편하게 예측하기
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
};

export default MainPage;