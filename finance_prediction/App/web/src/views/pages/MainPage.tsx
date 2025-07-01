import React from 'react';
import StockCard from '../components/StockCard';
import { useStocks } from '../../hooks/useStocks';

interface MainPageProps {
  onStockSelect: (stock: any) => void;
}

const MainPage: React.FC<MainPageProps> = ({ onStockSelect }) => {
    const { domesticStocks, internationalStocks, loading, error } = useStocks();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-lg text-gray-600">주식 정보를 불러오는 중...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-lg text-red-600">오류: {error}</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen relative">
            <style>{`
                @keyframes fade-in-up {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.6s ease-out forwards;
                }
                .animate-title {
                    animation: fade-in-up 0.8s ease-out 0.2s forwards;
                }
            `}</style>

            {/* 배경 */}
            <div className="absolute inset-0 bg-white dark:bg-black"></div>

            {/* 메인 콘텐츠 */}
            <div className="relative z-10 min-h-screen">
                <div className="grid grid-cols-1 lg:grid-cols-5 min-h-screen">
                    {/* 좌측 - 제목 영역 (3/5) */}
                    <div className="lg:col-span-3 flex items-start justify-center pl-16 lg:pl-32 pr-8 lg:pr-16 pt-64">
                        <div className="opacity-0 animate-title w-full max-w-4xl">
                            <h1 className="text-5xl md:text-5xl lg:text-6xl font-bold leading-tight">
                                <div className="whitespace-nowrap">
                                    <span className="text-gray-500">우리나라가 사랑하는 </span>
                                    <span className="text-black dark:text-white">국내주, 미국주</span>
                                </div>
                                <div className="mt-6 whitespace-nowrap">
                                    <span className="text-gray-500">쉽고 간편하게 </span>
                                    <span className="bg-gradient-to-r from-purple-500 to-green-500 bg-clip-text text-transparent">
                            예측하기
                        </span>
                                </div>
                            </h1>
                        </div>
                    </div>

                    {/* 우측 - 주식 리스트 영역 */}
                    <div className="lg:col-span-2 flex items-start pt-24 p-8 lg:p-32">
                        <div className="w-full space-y-8">
                            {/* 국내 주식 섹션 */}
                            <section>
                                <div className="space-y-0">
                                    {domesticStocks.map((stock, index) => (
                                        <StockCard key={stock.symbol} stock={stock} onClick={onStockSelect} index={index} />
                                    ))}
                                </div>
                            </section>

                            {/* 해외 주식 섹션 */}
                            <section>
                                <div className="space-y-0">
                                    {internationalStocks.map((stock, index) => (
                                        <StockCard key={stock.symbol} stock={stock} onClick={onStockSelect} index={index + domesticStocks.length} />
                                    ))}
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MainPage;