import { useState, useCallback } from 'react';
import { stockAPI } from '../services/stockAPI';
import type {
    PredictionData,
    ProphetPredictionData,
    ClusterPredictionData,
    ClusterModelInfo,
    ClusterSequenceAnalysis,
    LSTMPredictionData
} from '../services/stockAPI';

interface UseStockPredictionReturn {
    predictionData: PredictionData | null;
    prophetData: ProphetPredictionData | null;
    clusterData: ClusterPredictionData | null;
    clusterModelInfo: ClusterModelInfo | null;
    clusterSequenceAnalysis: ClusterSequenceAnalysis | null;
    lstmData: LSTMPredictionData | null;
    currentPrice: number | null;
    loading: boolean;
    error: string | null;
    fetchProphetPrediction: (symbol: string, days?: number, period?: string, retrain?: boolean) => Promise<ProphetPredictionData>;
    fetchClusterPrediction: (symbol: string, period?: string, retrain?: boolean) => Promise<ClusterPredictionData>;
    fetchClusterModelInfo: (symbol: string) => Promise<ClusterModelInfo>;
    fetchClusterSequenceAnalysis: (symbol: string) => Promise<ClusterSequenceAnalysis>;
    fetchLSTMPrediction: (symbol: string, days?: number, period?: string, retrain?: boolean) => Promise<LSTMPredictionData>;
    fetchCurrentPrice: (symbol: string) => Promise<number>;
    clearPrediction: () => void;
}

export const useStockPrediction = (): UseStockPredictionReturn => {
    const [predictionData, setPredictionData] = useState<PredictionData | null>(null);
    const [prophetData, setProphetData] = useState<ProphetPredictionData | null>(null);
    const [clusterData, setClusterData] = useState<ClusterPredictionData | null>(null);
    const [clusterModelInfo, setClusterModelInfo] = useState<ClusterModelInfo | null>(null);
    const [clusterSequenceAnalysis, setClusterSequenceAnalysis] = useState<ClusterSequenceAnalysis | null>(null);
    const [lstmData, setLstmData] = useState<LSTMPredictionData | null>(null);
    const [currentPrice, setCurrentPrice] = useState<number | null>(null);
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

    const fetchClusterPrediction = useCallback(async (
        symbol: string,
        period: string = '5y',
        retrain: boolean = false
    ) => {
        setLoading(true);
        setError(null);
        setClusterData(null);

        try {
            const data = await stockAPI.fetchClusterPrediction(symbol, period, retrain);
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

    const fetchClusterModelInfo = useCallback(async (symbol: string) => {
        setLoading(true);
        setError(null);
        setClusterModelInfo(null);

        try {
            const data = await stockAPI.getClusterModelInfo(symbol);
            setClusterModelInfo(data);
            return data;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
            setError(errorMessage);
            console.error('Cluster model info failed:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchClusterSequenceAnalysis = useCallback(async (symbol: string) => {
        setLoading(true);
        setError(null);
        setClusterSequenceAnalysis(null);

        try {
            const data = await stockAPI.getClusterSequenceAnalysis(symbol);
            setClusterSequenceAnalysis(data);
            return data;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
            setError(errorMessage);
            console.error('Cluster sequence analysis failed:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchLSTMPrediction = useCallback(async (
        symbol: string,
        days: number = 5,
        period: string = '1y',
        retrain: boolean = false
    ) => {
        setLoading(true);
        setError(null);
        setLstmData(null);

        try {
            const data = await stockAPI.fetchLSTMPrediction(symbol, days, period, retrain);
            setLstmData(data);
            return data;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
            setError(errorMessage);
            console.error('LSTM prediction failed:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchCurrentPrice = useCallback(async (symbol: string) => {
        setLoading(true);
        setError(null);
        setCurrentPrice(null);

        try {
            const price = await stockAPI.getCurrentPrice(symbol);
            setCurrentPrice(price);
            return price;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
            setError(errorMessage);
            console.error('Current price fetch failed:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const clearPrediction = useCallback(() => {
        setPredictionData(null);
        setProphetData(null);
        setClusterData(null);
        setClusterModelInfo(null);
        setClusterSequenceAnalysis(null);
        setLstmData(null);
        setCurrentPrice(null);
        setError(null);
    }, []);

    return {
        predictionData,
        prophetData,
        clusterData,
        clusterModelInfo,
        clusterSequenceAnalysis,
        lstmData,
        currentPrice,
        loading,
        error,
        fetchProphetPrediction,
        fetchClusterPrediction,
        fetchClusterModelInfo,
        fetchClusterSequenceAnalysis,
        fetchLSTMPrediction,
        fetchCurrentPrice,
        clearPrediction,
    };
};