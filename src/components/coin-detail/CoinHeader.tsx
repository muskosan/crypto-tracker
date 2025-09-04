import { ArrowLeft, Star, TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from '../ui/button';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { formatPrice } from '../../utils/formatters';
import { CHART_PERIODS } from '../../constants/chartPeriods';

interface CoinHeaderProps {
  coinData: {
    name: string;
    symbol: string;
    image: { large: string };
    market_data: {
      current_price: { usd: number };
      price_change_percentage_24h: number;
    };
  };
  onBack: () => void;
  isInWatchlist: boolean;
  onWatchlistToggle: () => void;
  onBuyClick: () => void;
  onSellClick: () => void;
  hasHolding: boolean;
  isUserLoggedIn: boolean;
  chartPeriod: string;
  onChartPeriodChange: (period: string) => void;
}

export function CoinHeader({
  coinData,
  onBack,
  isInWatchlist,
  onWatchlistToggle,
  onBuyClick,
  onSellClick,
  hasHolding,
  isUserLoggedIn,
  chartPeriod,
  onChartPeriodChange
}: CoinHeaderProps) {
  const currentPrice = coinData.market_data.current_price.usd;
  const priceChange24h = coinData.market_data.price_change_percentage_24h;
  const isPositive = priceChange24h >= 0;

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center space-x-3">
            <ImageWithFallback
              src={coinData.image.large}
              alt={coinData.name}
              className="w-10 h-10 rounded-full"
            />
            <div>
              <h1 className="flex items-center space-x-2">
                <span>{coinData.name}</span>
                <span className="text-muted-foreground">({coinData.symbol.toUpperCase()})</span>
              </h1>
              <p className="text-muted-foreground">Rank #{coinData.market_data.current_price ? '1' : 'N/A'}</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={onWatchlistToggle}
            disabled={!isUserLoggedIn}
          >
            <Star className={`w-4 h-4 ${isInWatchlist ? 'fill-yellow-400 text-yellow-400' : ''}`} />
          </Button>
          <Button 
            onClick={onBuyClick}
            disabled={!isUserLoggedIn}
          >
            Buy {coinData.symbol.toUpperCase()}
          </Button>
          {hasHolding && (
            <Button 
              variant="outline"
              onClick={onSellClick}
            >
              Sell {coinData.symbol.toUpperCase()}
            </Button>
          )}
        </div>
      </div>

      {/* Price and Period Controls */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-3xl font-bold">{formatPrice(currentPrice)}</div>
          <div className={`flex items-center space-x-1 mt-1 ${isPositive ? 'text-success' : 'text-error'}`}>
            {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <span>{isPositive ? '+' : ''}{priceChange24h.toFixed(2)}% (24h)</span>
          </div>
        </div>
        
        <div className="flex space-x-2">
          {CHART_PERIODS.map((period) => (
            <Button
              key={period.value}
              variant={chartPeriod === period.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => onChartPeriodChange(period.value)}
            >
              {period.label}
            </Button>
          ))}
        </div>
      </div>
    </>
  );
}