import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { formatPrice } from '../../utils/formatters';

interface PortfolioHoldingsProps {
  holding: {
    amount: number;
    avgPrice: number;
  };
  coinSymbol: string;
  currentPrice: number;
}

export function PortfolioHoldings({ holding, coinSymbol, currentPrice }: PortfolioHoldingsProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Your Holdings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Amount</span>
            <span className="text-sm font-medium">{holding.amount} {coinSymbol}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Avg. Cost</span>
            <span className="text-sm font-medium">{formatPrice(holding.avgPrice)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Current Value</span>
            <span className="text-sm font-medium">{formatPrice(holding.amount * currentPrice)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">P&L</span>
            <span className={`text-sm font-medium ${
              (currentPrice - holding.avgPrice) >= 0 ? 'text-success' : 'text-error'
            }`}>
              {formatPrice((currentPrice - holding.avgPrice) * holding.amount)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}