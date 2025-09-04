import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { CryptoAPI, CoinDetailData } from '../services/cryptoApi';
import { useAuth } from '../contexts/AuthContext';
import { usePortfolio } from '../contexts/PortfolioContext';
import { TradingModal } from './TradingModal';
import { toast } from 'sonner@2.0.3';
import { CoinHeader } from './coin-detail/CoinHeader';
import { CoinChart } from './coin-detail/CoinChart';
import { PortfolioHoldings } from './coin-detail/PortfolioHoldings';
import { MarketStats } from './coin-detail/MarketStats';

interface CoinDetailPageProps {
  coinId: string;
  onBack: () => void;
}

export function CoinDetailPage({ coinId, onBack }: CoinDetailPageProps) {
  const { user } = useAuth();
  const { portfolio, addToWatchlist, removeFromWatchlist } = usePortfolio();
  const [coinData, setCoinData] = useState<CoinDetailData | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartPeriod, setChartPeriod] = useState('7');
  const [showTradingModal, setShowTradingModal] = useState(false);
  const [tradingType, setTradingType] = useState<'buy' | 'sell'>('buy');

  const isInWatchlist = portfolio?.watchlist.includes(coinId) || false;
  const holding = portfolio?.holdings.find(h => h.coinId === coinId);

  useEffect(() => {
    const fetchCoinData = async () => {
      setLoading(true);
      try {
        const [detail, history] = await Promise.all([
          CryptoAPI.getCoinById(coinId),
          CryptoAPI.getCoinHistory(coinId, parseInt(chartPeriod))
        ]);

        setCoinData(detail);
        
        // Format chart data
        const formattedChartData = history.map((point, index) => ({
          time: new Date(point[0]).toLocaleDateString(),
          price: point[1],
          index
        }));
        
        setChartData(formattedChartData);
      } catch (error) {
        console.error('Failed to fetch coin data:', error);
        toast.error('Failed to load coin data');
      } finally {
        setLoading(false);
      }
    };

    fetchCoinData();
  }, [coinId, chartPeriod]);

  const handleWatchlistToggle = async () => {
    if (!user) {
      toast.error('Please sign in to manage your watchlist');
      return;
    }

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!coinData) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p>Failed to load coin data</p>
        <Button onClick={onBack} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  const currentPrice = coinData.market_data.current_price.usd;
  const priceChange24h = coinData.market_data.price_change_percentage_24h;
  const isPositive = priceChange24h >= 0;

  return (
    <div className="container mx-auto px-4 py-6">
      <CoinHeader
        coinData={coinData}
        onBack={onBack}
        isInWatchlist={isInWatchlist}
        onWatchlistToggle={handleWatchlistToggle}
        onBuyClick={() => { setTradingType('buy'); setShowTradingModal(true); }}
        onSellClick={() => { setTradingType('sell'); setShowTradingModal(true); }}
        hasHolding={!!holding}
        isUserLoggedIn={!!user}
        chartPeriod={chartPeriod}
        onChartPeriodChange={setChartPeriod}
      />

      {/* Price Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-6">
              <CoinChart
                chartData={chartData}
                isPositive={isPositive}
                chartPeriod={chartPeriod}
              />
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-4">
          {holding && (
            <PortfolioHoldings
              holding={holding}
              coinSymbol={coinData.symbol.toUpperCase()}
              currentPrice={currentPrice}
            />
          )}
          
          <MarketStats marketData={coinData.market_data} />
        </div>
      </div>

      {/* Description */}
      <Card>
        <CardHeader>
          <CardTitle>About {coinData.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div 
            className="text-sm text-muted-foreground"
            dangerouslySetInnerHTML={{
              __html: coinData.description.en.split('. ')[0] + '.'
            }}
          />
        </CardContent>
      </Card>

      {/* Trading Modal */}
      {showTradingModal && (
        <TradingModal
          isOpen={showTradingModal}
          onClose={() => setShowTradingModal(false)}
          coinId={coinId}
          coinName={coinData.name}
          coinSymbol={coinData.symbol.toUpperCase()}
          currentPrice={currentPrice}
          type={tradingType}
          maxSellAmount={holding?.amount || 0}
        />
      )}
    </div>
  );
}