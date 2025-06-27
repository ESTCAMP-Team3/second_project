import { useState, useCallback } from 'react';
import { stockAPI } from '../services/stockAPI';
import type { Period, PredictionData } from '../services/stockAPI';

interface UseStockPredictionReturn {
    predictionData: PredictionData | null;
    loading: boolean;
    error: string | null;
    fetchPrediction: (symbol: string, periods?: Period[]) => Promise<PredictionData>;
    clearPrediction: () => void;
}

export const useStockPrediction = (): UseStockPredictionReturn => {
    const [predictionData, setPredictionData] = useState<PredictionData | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchPrediction = useCallback(async (symbol: string, periods: Period[] = ['short', 'medium', 'long']) => {
        setLoading(true);
        setError(null);
        setPredictionData(null);

        try {
            const data = await stockAPI.fetchPrediction(symbol, periods);
            setPredictionData(data);
            return data;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
            setError(errorMessage);
            console.error('Prediction failed:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const clearPrediction = useCallback(() => {
        setPredictionData(null);
        setError(null);
    }, []);

    return {
        predictionData,
        loading,
        error,
        fetchPrediction,
        clearPrediction
    };
};