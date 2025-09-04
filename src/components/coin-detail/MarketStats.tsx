import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { formatPrice, formatMarketCap } from '../../utils/formatters';

interface MarketStatsProps {
  marketData: {
    market_cap: { usd: number };
    total_volume: { usd: number };
    circulating_supply: number | null;
    ath: { usd: number };
    atl: { usd: number };
  };
}

export function MarketStats({ marketData }: MarketStatsProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Market Stats</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Market Cap</span>
          <span className="text-sm font-medium">
            {formatMarketCap(marketData.market_cap.usd)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">24h Volume</span>
          <span className="text-sm font-medium">
            {formatMarketCap(marketData.total_volume.usd)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Circulating Supply</span>
          <span className="text-sm font-medium">
            {marketData.circulating_supply?.toLocaleString() || 'N/A'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">All-Time High</span>
          <span className="text-sm font-medium">
            {formatPrice(marketData.ath.usd)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">All-Time Low</span>
          <span className="text-sm font-medium">
            {formatPrice(marketData.atl.usd)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}