import { useState, useEffect } from 'react';
import { stockAPI } from '../stockAPI';

export const useApiConnection = () => {
    const [isConnected, setIsConnected] = useState(false);
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        const checkConnection = async () => {
            setIsChecking(true);
            try {
                const connected = await stockAPI.checkAPIStatus();
                setIsConnected(connected);
            } catch (error) {
                console.error('API connection check failed:', error);
                setIsConnected(false);
            } finally {
                setIsChecking(false);
            }
        };

        checkConnection();

        // 30초마다 연결 상태 재확인
        const interval = setInterval(checkConnection, 30000);

        return () => clearInterval(interval);
    }, []);

    return { isConnected, isChecking };
};