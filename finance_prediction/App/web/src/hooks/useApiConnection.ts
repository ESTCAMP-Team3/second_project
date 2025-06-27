import { useState, useEffect } from 'react';
import { stockAPI } from '../services/stockAPI';

interface ApiConnectionStatus {
    isConnected: boolean;
    isChecking: boolean;
}

export const useApiConnection = (): ApiConnectionStatus => {
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [isChecking, setIsChecking] = useState<boolean>(true);

    useEffect(() => {
        const checkConnection = async () => {
            setIsChecking(true);
            try {
                const connected: boolean = await stockAPI.checkAPIStatus();
                setIsConnected(connected);
            } catch (error) {
                console.error('API connection check failed:', error);
                setIsConnected(false);
            } finally {
                setIsChecking(false);
            }
        };

        checkConnection();

        const interval = setInterval(checkConnection, 30000);

        return () => clearInterval(interval);
    }, []);

    return { isConnected, isChecking };
};