import { useState, useEffect } from 'react';
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { useAuth } from '../contexts/AuthContext';
import { usePortfolio } from '../contexts/PortfolioContext';
import { CryptoAPI, CoinData } from '../services/cryptoApi';

interface PortfolioDashboardProps {
  onBack: () => void;
  onCoinSelect: (coinId: string) => void;
}

export function PortfolioDashboard({ onBack, onCoinSelect }: PortfolioDashboardProps) {
  const { user } = useAuth();
  const { portfolio, trades, loading } = usePortfolio();
  const [holdingsWithPrices, setHoldingsWithPrices] = useState<any[]>([]);
  const [watchlistCoins, setWatchlistCoins] = useState<CoinData[]>([]);
  const [loadingPrices, setLoadingPrices] = useState(false);

  useEffect(() => {
    const fetchCurrentPrices = async () => {
      if (!portfolio) return;
      
      setLoadingPrices(true);
      try {
        // Fetch current prices for holdings
        if (portfolio.holdings.length > 0) {
          const coins = await CryptoAPI.getCoins(1, 100);
          const holdingsWithCurrentPrices = portfolio.holdings.map(holding => {
            const coinData = coins.find(coin => coin.id === holding.coinId);
            const currentPrice = coinData?.current_price || 0;
            const currentValue = holding.amount * currentPrice;
            const totalCost = holding.amount * holding.avgPrice;
            const profitLoss = currentValue - totalCost;
            const profitLossPercentage = ((currentPrice - holding.avgPrice) / holding.avgPrice) * 100;

            return {
              ...holding,
              coinName: coinData?.name || holding.coinId,
              coinSymbol: coinData?.symbol.toUpperCase() || '',
              coinImage: coinData?.image || '',
              currentPrice,
              currentValue,
              profitLoss,
              profitLossPercentage: isFinite(profitLossPercentage) ? profitLossPercentage : 0,
            };
          });
          setHoldingsWithPrices(holdingsWithCurrentPrices);
        }

        // Fetch watchlist coins
        if (portfolio.watchlist.length > 0) {
          const allCoins = await CryptoAPI.getCoins(1, 250);
          const watchlistCoinsData = allCoins.filter(coin => 
            portfolio.watchlist.includes(coin.id)
          );
          setWatchlistCoins(watchlistCoinsData);
        }
      } catch (error) {
        console.error('Failed to fetch current prices:', error);
      } finally {
        setLoadingPrices(false);
      }
    };

    fetchCurrentPrices();
  }, [portfolio]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: price >= 1 ? 2 : 6,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const totalPortfolioValue = holdingsWithPrices.reduce((sum, holding) => sum + holding.currentValue, 0);
  const totalProfitLoss = holdingsWithPrices.reduce((sum, holding) => sum + holding.profitLoss, 0);
  const totalCost = holdingsWithPrices.reduce((sum, holding) => sum + (holding.amount * holding.avgPrice), 0);
  const totalProfitLossPercentage = totalCost > 0 ? ((totalPortfolioValue - totalCost) / totalCost) * 100 : 0;

  if (loading || loadingPrices) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-6">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1>Portfolio</h1>
          <p className="text-muted-foreground">Welcome back, {user?.name}</p>
        </div>
      </div>

      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="transition-all duration-300 ease-out hover:scale-105 hover:shadow-lg cursor-default">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium uppercase tracking-wide">Total Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-serif font-bold tracking-tight">{formatPrice(totalPortfolioValue)}</div>
          </CardContent>
        </Card>

        <Card className="transition-all duration-300 ease-out hover:scale-105 hover:shadow-lg cursor-default">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium uppercase tracking-wide">Total P&L</CardTitle>
            {totalProfitLoss >= 0 ? (
              <TrendingUp className="h-4 w-4 text-success" />
            ) : (
              <TrendingDown className="h-4 w-4 text-error" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-serif font-bold tracking-tight ${totalProfitLoss >= 0 ? 'text-success' : 'text-error'}`}>
              {formatPrice(totalProfitLoss)}
            </div>
            <p className={`text-xs ${totalProfitLoss >= 0 ? 'text-success' : 'text-error'}`}>
              {totalProfitLoss >= 0 ? '+' : ''}{totalProfitLossPercentage.toFixed(2)}%
            </p>
          </CardContent>
        </Card>

        <Card className="transition-all duration-300 ease-out hover:scale-105 hover:shadow-lg cursor-default">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium uppercase tracking-wide">Total Trades</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-serif font-bold tracking-tight">{trades.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="holdings" className="space-y-4">
        <TabsList>
          <TabsTrigger value="holdings">Holdings</TabsTrigger>
          <TabsTrigger value="watchlist">Watchlist</TabsTrigger>
          <TabsTrigger value="history">Trade History</TabsTrigger>
        </TabsList>

        <TabsContent value="holdings">
          <Card>
            <CardHeader>
              <CardTitle>Your Holdings</CardTitle>
            </CardHeader>
            <CardContent>
              {holdingsWithPrices.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">You don't have any holdings yet.</p>
                  <Button onClick={onBack}>Start Trading</Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {holdingsWithPrices.map((holding) => (
                    <div
                      key={holding.coinId}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-all duration-300 ease-out hover:scale-[1.02] cursor-pointer"
                      onClick={() => onCoinSelect(holding.coinId)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">
                            {holding.coinSymbol.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium">{holding.coinName}</div>
                          <div className="text-sm text-muted-foreground">
                            {holding.amount} {holding.coinSymbol}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="font-medium">{formatPrice(holding.currentValue)}</div>
                        <div className={`text-sm flex items-center justify-end space-x-1 ${
                          holding.profitLoss >= 0 ? 'text-success' : 'text-error'
                        }`}>
                          {holding.profitLoss >= 0 ? (
                            <TrendingUp className="w-3 h-3" />
                          ) : (
                            <TrendingDown className="w-3 h-3" />
                          )}
                          <span>
                            {formatPrice(holding.profitLoss)} ({holding.profitLossPercentage.toFixed(2)}%)
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="watchlist">
          <Card>
            <CardHeader>
              <CardTitle>Watchlist</CardTitle>
            </CardHeader>
            <CardContent>
              {watchlistCoins.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">Your watchlist is empty.</p>
                  <Button onClick={onBack}>Browse Cryptocurrencies</Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {watchlistCoins.map((coin) => (
                    <div
                      key={coin.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-all duration-300 ease-out hover:scale-[1.02] cursor-pointer"
                      onClick={() => onCoinSelect(coin.id)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">
                            {coin.symbol.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium">{coin.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {coin.symbol.toUpperCase()}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="font-medium">{formatPrice(coin.current_price)}</div>
                        <Badge
                          variant={coin.price_change_percentage_24h >= 0 ? "default" : "destructive"}
                          className={`${
                            coin.price_change_percentage_24h >= 0
                              ? "bg-success/10 text-success hover:bg-success/10"
                              : "bg-error/10 text-error hover:bg-error/10"
                          }`}
                        >
                          {coin.price_change_percentage_24h >= 0 ? '+' : ''}
                          {coin.price_change_percentage_24h.toFixed(2)}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Trade History</CardTitle>
            </CardHeader>
            <CardContent>
              {trades.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No trades yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {trades.reverse().map((trade, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Badge variant={trade.type === 'buy' ? 'default' : 'destructive'}>
                          {trade.type.toUpperCase()}
                        </Badge>
                        <div>
                          <div className="font-medium">{trade.coinId.toUpperCase()}</div>
                          <div className="text-sm text-muted-foreground">
                            {formatDate(trade.timestamp)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="font-medium">
                          {trade.amount} @ {formatPrice(trade.price)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatPrice(trade.amount * trade.price)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}