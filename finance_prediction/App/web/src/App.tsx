import { useState } from 'react';
import MainPage from './views/pages/MainPage';
import PredictionPage from './views/pages/PredictionPage';
import ErrorMessage from './views/components/ErrorMessage';
import Loading from './views/components/Loading';
import { useApiConnection } from './hooks/useApiConnection';
import type { Stock } from './constants/stocks';

// 주식 데이터 상태 (타입 제거)
const VIEWS = {
    MAIN: 'main',
    PREDICTION: 'prediction',
};

function App() {
    const [currentView, setCurrentView] = useState(VIEWS.MAIN);
    const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
    const { isConnected, isChecking } = useApiConnection();

    // 주식 선택 시 예측 페이지로 이동
    const handleStockSelect = (stock: Stock) => {
        setSelectedStock(stock);
        setCurrentView(VIEWS.PREDICTION);
    };

    // 메인 페이지로 돌아가기
    const handleBackToMain = () => {
        setCurrentView(VIEWS.MAIN);
        setSelectedStock(null);
    };

    // API 연결 확인 중
    if (isChecking) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
                <Loading message="서버 연결을 확인하는 중..." />
            </div>
        );
    }

    // API 연결 실패
    if (!isConnected) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
                <div className="max-w-md w-full px-6">
                    <ErrorMessage
                        title="백엔드 연결 실패"
                        message="Flask 서버가 실행되고 있는지 확인해주세요. (http://localhost:5000)"
                        onRetry={() => {
                            // 재시도 로직
                            window.location.reload();
                        }}
                    />
                </div>
            </div>
        );
    }

    // 뷰 렌더링
    return (
        <div className="App">
            {currentView === VIEWS.MAIN && (
                <MainPage onStockSelect={handleStockSelect} />
            )}

            {currentView === VIEWS.PREDICTION && selectedStock && (
                <PredictionPage
                    selectedStock={selectedStock}
                    onBack={handleBackToMain}
                />
            )}
        </div>
    );
}

export default App;