import { useState, useCallback } from 'react';
import { stockAPI } from '../services/stockApi';

export const useStockPrediction = () => {
    const [predictionData, setPredictionData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchPrediction = useCallback(async (symbol, periods = ['short', 'medium', 'long']) => {
        setLoading(true);
        setError(null);
        setPredictionData(null);

        try {
            const data = await stockAPI.fetchPrediction(symbol, periods);
            setPredictionData(data);
            return data;
        } catch (err) {
            setError(err.message);
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