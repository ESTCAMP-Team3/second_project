import { useState, useEffect } from 'react';
import { stockAPI } from '../services/stockAPI';

export interface Stock {
  symbol: string;
  name: string;
  type: 'domestic' | 'international'; // API 필드명과 맞춤
}

interface UseStocksReturn {
  stocks: Stock[];
  domesticStocks: Stock[];
  internationalStocks: Stock[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useStocks = (): UseStocksReturn => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStocks = async () => {
    try {
      setLoading(true);
      setError(null);

      const stocksData = await stockAPI.getAvailableStocks();
      setStocks(stocksData);
    } catch (err) {
      console.error('Error fetching stocks:', err);
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStocks();
  }, []);

  // type 필드로 필터링
  const domesticStocks = stocks.filter(stock => stock.type === 'domestic');
  const internationalStocks = stocks.filter(stock => stock.type === 'international');

  return {
    stocks,
    domesticStocks,
    internationalStocks,
    loading,
    error,
    refetch: fetchStocks,
  };
};