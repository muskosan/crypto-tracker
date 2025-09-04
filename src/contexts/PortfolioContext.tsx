import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface Holding {
  coinId: string;
  amount: number;
  avgPrice: number;
  purchaseDate: string;
  lastUpdated: string;
}

interface Portfolio {
  holdings: Holding[];
  watchlist: string[];
  totalValue: number;
  createdAt: string;
}

interface Trade {
  userId: string;
  coinId: string;
  type: 'buy' | 'sell';
  amount: number;
  price: number;
  timestamp: string;
}

interface PortfolioContextType {
  portfolio: Portfolio | null;
  trades: Trade[];
  loading: boolean;
  refreshPortfolio: () => Promise<void>;
  addToWatchlist: (coinId: string) => Promise<void>;
  removeFromWatchlist: (coinId: string) => Promise<void>;
  executeTrade: (coinId: string, type: 'buy' | 'sell', amount: number, price: number) => Promise<void>;
  getTradeHistory: () => Promise<void>;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

export function PortfolioProvider({ children }: { children: ReactNode }) {
  const { user, accessToken } = useAuth();
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(false);

  const makeRequest = async (url: string, options: RequestInit = {}) => {
    if (!accessToken) throw new Error('Not authenticated');
    
    const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-9a7f9b62${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  };

  const refreshPortfolio = async () => {
    if (!user || !accessToken) return;
    
    setLoading(true);
    try {
      const portfolioData = await makeRequest(`/portfolio/${user.id}`);
      setPortfolio(portfolioData);
    } catch (error) {
      console.error('Failed to fetch portfolio:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToWatchlist = async (coinId: string) => {
    if (!user) return;
    
    try {
      const updatedPortfolio = await makeRequest(`/portfolio/${user.id}/watchlist`, {
        method: 'POST',
        body: JSON.stringify({ coinId, action: 'add' }),
      });
      setPortfolio(updatedPortfolio);
    } catch (error) {
      console.error('Failed to add to watchlist:', error);
      throw error;
    }
  };

  const removeFromWatchlist = async (coinId: string) => {
    if (!user) return;
    
    try {
      const updatedPortfolio = await makeRequest(`/portfolio/${user.id}/watchlist`, {
        method: 'POST',
        body: JSON.stringify({ coinId, action: 'remove' }),
      });
      setPortfolio(updatedPortfolio);
    } catch (error) {
      console.error('Failed to remove from watchlist:', error);
      throw error;
    }
  };

  const executeTrade = async (coinId: string, type: 'buy' | 'sell', amount: number, price: number) => {
    if (!user) return;
    
    try {
      const response = await makeRequest('/trade', {
        method: 'POST',
        body: JSON.stringify({
          userId: user.id,
          coinId,
          type,
          amount,
          price,
        }),
      });
      
      if (response.portfolio) {
        setPortfolio(response.portfolio);
      }
      
      // Refresh trade history
      await getTradeHistory();
    } catch (error) {
      console.error('Failed to execute trade:', error);
      throw error;
    }
  };

  const getTradeHistory = async () => {
    if (!user) return;
    
    try {
      const tradesData = await makeRequest(`/trades/${user.id}`);
      setTrades(tradesData);
    } catch (error) {
      console.error('Failed to fetch trade history:', error);
    }
  };

  useEffect(() => {
    if (user && accessToken) {
      refreshPortfolio();
      getTradeHistory();
    } else {
      setPortfolio(null);
      setTrades([]);
    }
  }, [user, accessToken]);

  const value = {
    portfolio,
    trades,
    loading,
    refreshPortfolio,
    addToWatchlist,
    removeFromWatchlist,
    executeTrade,
    getTradeHistory,
  };

  return (
    <PortfolioContext.Provider value={value}>
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolio() {
  const context = useContext(PortfolioContext);
  if (context === undefined) {
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  return context;
}