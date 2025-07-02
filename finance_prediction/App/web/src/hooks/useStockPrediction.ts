import { useState, useCallback } from 'react';
import { stockAPI } from '../services/stockAPI';
import type { PredictionData, ProphetPredictionData, ClusterPredictionData } from '../services/stockAPI';

interface UseStockPredictionReturn {
    predictionData: PredictionData | null;
    prophetData: ProphetPredictionData | null;
    clusterData: ClusterPredictionData | null;
    loading: boolean;
    error: string | null;
    fetchProphetPrediction: (symbol: string, days?: number, period?: string, retrain?: boolean) => Promise<ProphetPredictionData>;
    fetchClusterPrediction: (symbol: string, days?: number) => Promise<ClusterPredictionData>;
    clearPrediction: () => void;
}

export const useStockPrediction = (): UseStockPredictionReturn => {
    const [predictionData, setPredictionData] = useState<PredictionData | null>(null);
    const [prophetData, setProphetData] = useState<ProphetPredictionData | null>(null);
    const [clusterData, setClusterData] = useState<ClusterPredictionData | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchProphetPrediction = useCallback(async (
        symbol: string, 
        days: number = 5, 
        period: string = '1y', 
        retrain: boolean = false
    ) => {
        setLoading(true);
        setError(null);
        setProphetData(null);

        try {
            const data = await stockAPI.fetchProphetPrediction(symbol, days, period, retrain);
            setProphetData(data);
            return data;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
            setError(errorMessage);
            console.error('Prophet prediction failed:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchClusterPrediction = useCallback(async (symbol: string, days: number = 10) => {
        setLoading(true);
        setError(null);
        setClusterData(null);

        try {
            const data = await stockAPI.fetchClusterPrediction(symbol, days);
            setClusterData(data);
            return data;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
            setError(errorMessage);
            console.error('Cluster prediction failed:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const clearPrediction = useCallback(() => {
        setPredictionData(null);
        setProphetData(null);
        setClusterData(null);
        setError(null);
    }, []);

    return {
        predictionData,
        prophetData,
        clusterData,
        loading,
        error,
        fetchProphetPrediction,
        fetchClusterPrediction,
        clearPrediction,
    };
};