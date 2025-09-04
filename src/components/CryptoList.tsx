import { useState, useEffect } from 'react';
import { Star, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card, CardContent } from "./ui/card";
import { MiniChart } from "./MiniChart";
import { CryptoAPI, CoinData } from '../services/cryptoApi';
import { useAuth } from '../contexts/AuthContext';
import { usePortfolio } from '../contexts/PortfolioContext';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { toast } from 'sonner@2.0.3';

interface CryptoListProps {
  onCoinSelect: (coinId: string) => void;
  searchResults?: any[];
}

function formatPrice(price: number): string {
  if (price >= 1) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  } else {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 4,
      maximumFractionDigits: 4,
    }).format(price);
  }
}

function formatMarketCap(marketCap: number): string {
  if (marketCap >= 1e12) {
    return `$${(marketCap / 1e12).toFixed(2)}T`;
  } else if (marketCap >= 1e9) {
    return `$${(marketCap / 1e9).toFixed(2)}B`;
  } else if (marketCap >= 1e6) {
    return `$${(marketCap / 1e6).toFixed(2)}M`;
  }
  return `$${marketCap.toLocaleString()}`;
}

export function CryptoList({ onCoinSelect, searchResults }: CryptoListProps) {
  const { user } = useAuth();
  const { portfolio, addToWatchlist, removeFromWatchlist } = usePortfolio();
  const [cryptoData, setCryptoData] = useState<CoinData[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('market_cap_desc');

  useEffect(() => {
    const fetchCoins = async () => {
      setLoading(true);
      try {
        const coins = await CryptoAPI.getCoins(1, 50, sortBy);
        setCryptoData(coins);
      } catch (error) {
        console.error('Failed to fetch coins:', error);
        toast.error('Failed to load cryptocurrency data');
      } finally {
        setLoading(false);
      }
    };

    if (!searchResults) {
      fetchCoins();
    } else {
      setLoading(false);
    }
  }, [sortBy, searchResults]);

  const handleWatchlistToggle = async (coinId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      toast.error('Please sign in to manage your watchlist');
      return;
    }

    const isInWatchlist = portfolio?.watchlist.includes(coinId) || false;
    
    try {
      if (isInWatchlist) {
        await removeFromWatchlist(coinId);
        toast.success('Removed from watchlist');
      } else {
        await addToWatchlist(coinId);
        toast.success('Added to watchlist');
      }
    } catch (error) {
      toast.error('Failed to update watchlist');
    }
  };

  const displayData = searchResults?.length ? 
    searchResults.map(coin => ({
      id: coin.id,
      name: coin.name,
      symbol: coin.symbol,
      market_cap_rank: coin.market_cap_rank || 0,
      current_price: 0, // Search results don't include price data
      price_change_percentage_24h: 0,
      price_change_percentage_7d_in_currency: 0,
      market_cap: 0,
      total_volume: 0,
      image: coin.thumb,
      sparkline_in_7d: { price: [] }
    })) : cryptoData;

  if (loading) {
    return (
      <div className="container mx-auto px-4 pb-8">
        <Card>
          <CardContent className="p-0">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 pb-8">
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-medium text-muted-foreground">#</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Name</th>
                  <th className="text-right p-4 font-medium text-muted-foreground">Price</th>
                  <th className="text-right p-4 font-medium text-muted-foreground">24h %</th>
                  <th className="text-right p-4 font-medium text-muted-foreground">7d %</th>
                  <th className="text-right p-4 font-medium text-muted-foreground">Market Cap</th>
                  <th className="text-right p-4 font-medium text-muted-foreground">Volume(24h)</th>
                  <th className="text-center p-4 font-medium text-muted-foreground">Last 7 Days</th>
                  <th className="text-center p-4 font-medium text-muted-foreground"></th>
                </tr>
              </thead>
              <tbody>
                {displayData.map((crypto) => {
                  const isInWatchlist = portfolio?.watchlist.includes(crypto.id) || false;
                  const change24h = crypto.price_change_percentage_24h || 0;
                  const change7d = crypto.price_change_percentage_7d_in_currency || 0;
                  
                  return (
                    <tr
                      key={crypto.id}
                      className="border-b hover:bg-muted/50 transition-all duration-300 ease-out hover:scale-[1.01] cursor-pointer"
                      onClick={() => onCoinSelect(crypto.id)}
                    >
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-4 h-4 p-0"
                            onClick={(e) => handleWatchlistToggle(crypto.id, e)}
                            disabled={!user}
                          >
                            <Star
                              className={`w-4 h-4 ${
                                isInWatchlist
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-muted-foreground"
                              }`}
                            />
                          </Button>
                          <span className="text-muted-foreground">{crypto.market_cap_rank || '-'}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          {crypto.image ? (
                            <ImageWithFallback
                              src={crypto.image}
                              alt={crypto.name}
                              className="w-8 h-8 rounded-full"
                            />
                          ) : (
                            <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs font-bold">
                                {crypto.symbol.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                          <div>
                            <div className="font-medium">{crypto.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {crypto.symbol.toUpperCase()}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-right font-medium">
                        {crypto.current_price ? formatPrice(crypto.current_price) : 'N/A'}
                      </td>
                      <td className="p-4 text-right">
                        {crypto.current_price ? (
                          <Badge
                            variant={change24h >= 0 ? "default" : "destructive"}
                            className={`flex items-center space-x-1 justify-end ${
                              change24h >= 0
                                ? "bg-success/10 text-success hover:bg-success/10"
                                : "bg-error/10 text-error hover:bg-error/10"
                            }`}
                          >
                            {change24h >= 0 ? (
                              <TrendingUp className="w-3 h-3" />
                            ) : (
                              <TrendingDown className="w-3 h-3" />
                            )}
                            <span>{change24h.toFixed(2)}%</span>
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">N/A</span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        {crypto.current_price ? (
                          <span
                            className={
                              change7d >= 0
                                ? "text-success"
                                : "text-error"
                            }
                          >
                            {change7d >= 0 ? "+" : ""}
                            {change7d.toFixed(2)}%
                          </span>
                        ) : (
                          <span className="text-muted-foreground">N/A</span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        {crypto.market_cap ? formatMarketCap(crypto.market_cap) : 'N/A'}
                      </td>
                      <td className="p-4 text-right">
                        {crypto.total_volume ? formatMarketCap(crypto.total_volume) : 'N/A'}
                      </td>
                      <td className="p-4 text-center">
                        {crypto.sparkline_in_7d?.price?.length > 0 ? (
                          <MiniChart
                            data={crypto.sparkline_in_7d.price}
                            isPositive={change7d >= 0}
                          />
                        ) : (
                          <span className="text-muted-foreground text-xs">N/A</span>
                        )}
                      </td>
                      <td className="p-4">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onCoinSelect(crypto.id);
                          }}
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}