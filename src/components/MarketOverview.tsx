import { useState, useEffect } from 'react';
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";
import { CryptoAPI, GlobalMarketData } from '../services/cryptoApi';

export function MarketOverview() {
  const [marketData, setMarketData] = useState<GlobalMarketData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        const data = await CryptoAPI.getGlobalMarketData();
        setMarketData(data);
      } catch (error) {
        console.error('Failed to fetch market data:', error);
        // Set some fallback data or show an error state
        setMarketData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchMarketData();
    
    // Refetch every 30 seconds
    const interval = setInterval(fetchMarketData, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1e12) return `${(marketCap / 1e12).toFixed(2)}T`;
    if (marketCap >= 1e9) return `${(marketCap / 1e9).toFixed(2)}B`;
    return `${marketCap.toLocaleString()}`;
  };

  const marketStats = marketData ? [
    {
      label: "Market Cap",
      value: formatMarketCap(marketData.data.total_market_cap.usd),
      change: `${marketData.data.market_cap_change_percentage_24h_usd >= 0 ? '+' : ''}${marketData.data.market_cap_change_percentage_24h_usd.toFixed(2)}%`,
      isPositive: marketData.data.market_cap_change_percentage_24h_usd >= 0,
    },
    {
      label: "24h Volume",
      value: formatMarketCap(marketData.data.total_volume.usd),
      change: "N/A",
      isPositive: true,
    },
    {
      label: "Bitcoin Dominance",
      value: `${marketData.data.market_cap_percentage.btc.toFixed(1)}%`,
      change: "N/A",
      isPositive: true,
    },
    {
      label: "Active Cryptos",
      value: marketData.data.active_cryptocurrencies.toLocaleString(),
      change: "N/A",
      isPositive: true,
    },
  ] : [];

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="mb-2">Today's Cryptocurrency Prices</h1>
          <p className="text-muted-foreground">Loading market data...</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="transition-all duration-300 ease-out hover:scale-105 hover:shadow-lg cursor-default">
              <CardContent className="p-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-muted rounded w-20"></div>
                  <div className="h-9 bg-muted rounded w-32"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="mb-2">Today's Cryptocurrency Prices</h1>
        <p className="text-muted-foreground">
          {marketData 
            ? `The global cryptocurrency market cap today is ${formatMarketCap(marketData.data.total_market_cap.usd)}, a ${marketData.data.market_cap_change_percentage_24h_usd.toFixed(2)}% change in the last 24 hours.`
            : "Live cryptocurrency market data and prices."
          }
        </p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        {marketStats.length > 0 ? (
          marketStats.map((stat, index) => (
            <Card key={index} className="transition-all duration-300 ease-out hover:scale-105 hover:shadow-lg cursor-default">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground uppercase tracking-wide font-medium">{stat.label}</p>
                  <div className="flex flex-col space-y-2">
                    <span className="text-3xl font-serif font-bold tracking-tight">{stat.value}</span>
                    {stat.change !== "N/A" && (
                      <Badge
                        variant={stat.isPositive ? "default" : "destructive"}
                        className={`flex items-center space-x-1 w-fit ${
                          stat.isPositive 
                            ? "bg-success/10 text-success hover:bg-success/10" 
                            : "bg-error/10 text-error hover:bg-error/10"
                        }`}
                      >
                        {stat.isPositive ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        <span className="text-xs font-medium">{stat.change}</span>
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          // Fallback when market data is not available
          [
            { label: "Market Cap", value: "Loading..." },
            { label: "24h Volume", value: "Loading..." },
            { label: "Bitcoin Dominance", value: "Loading..." },
            { label: "Active Cryptos", value: "Loading..." },
          ].map((stat, index) => (
            <Card key={index} className="transition-all duration-300 ease-out hover:scale-105 hover:shadow-lg cursor-default">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground uppercase tracking-wide font-medium">{stat.label}</p>
                  <span className="text-3xl font-serif font-bold tracking-tight text-muted-foreground">{stat.value}</span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}