import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent } from './ui/card';
import { usePortfolio } from '../contexts/PortfolioContext';
import { toast } from 'sonner@2.0.3';

interface TradingModalProps {
  isOpen: boolean;
  onClose: () => void;
  coinId: string;
  coinName: string;
  coinSymbol: string;
  currentPrice: number;
  type: 'buy' | 'sell';
  maxSellAmount?: number;
}

export function TradingModal({
  isOpen,
  onClose,
  coinId,
  coinName,
  coinSymbol,
  currentPrice,
  type,
  maxSellAmount = 0
}: TradingModalProps) {
  const { executeTrade } = usePortfolio();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const numericAmount = parseFloat(amount) || 0;
  const totalValue = numericAmount * currentPrice;
  const isBuy = type === 'buy';

  const handleTrade = async () => {
    if (numericAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (!isBuy && numericAmount > maxSellAmount) {
      toast.error(`Cannot sell more than ${maxSellAmount} ${coinSymbol}`);
      return;
    }

    setLoading(true);
    try {
      await executeTrade(coinId, type, numericAmount, currentPrice);
      toast.success(`Successfully ${isBuy ? 'bought' : 'sold'} ${numericAmount} ${coinSymbol}`);
      onClose();
      setAmount('');
    } catch (error: any) {
      toast.error(error.message || `Failed to ${type} ${coinSymbol}`);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    }).format(price);
  };

  const setPercentageAmount = (percentage: number) => {
    if (isBuy) {
      // For buying, we'll assume a $1000 portfolio for demo purposes
      const portfolioValue = 1000;
      const targetValue = (portfolioValue * percentage) / 100;
      const targetAmount = targetValue / currentPrice;
      setAmount(targetAmount.toFixed(8));
    } else {
      // For selling, use percentage of current holdings
      const targetAmount = (maxSellAmount * percentage) / 100;
      setAmount(targetAmount.toFixed(8));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isBuy ? 'Buy' : 'Sell'} {coinName}
          </DialogTitle>
          <DialogDescription>
            Current price: {formatPrice(currentPrice)}
            {!isBuy && maxSellAmount > 0 && (
              <span className="block mt-1">Available to sell: {maxSellAmount} {coinSymbol}</span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Quick Amount Buttons */}
          <div className="grid grid-cols-4 gap-2">
            {[25, 50, 75, 100].map((percentage) => (
              <Button
                key={percentage}
                variant="outline"
                size="sm"
                onClick={() => setPercentageAmount(percentage)}
                className="text-xs"
              >
                {percentage}%
              </Button>
            ))}
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="amount">
              Amount ({coinSymbol})
            </Label>
            <Input
              id="amount"
              type="number"
              step="0.00000001"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={`Enter ${coinSymbol} amount`}
            />
          </div>

          {/* Trade Summary */}
          <Card>
            <CardContent className="p-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount:</span>
                  <span className="font-medium">{numericAmount} {coinSymbol}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Price per {coinSymbol}:</span>
                  <span className="font-medium">{formatPrice(currentPrice)}</span>
                </div>
                <div className="flex justify-between border-t pt-2 mt-2">
                  <span className="font-medium">Total {isBuy ? 'Cost' : 'Proceeds'}:</span>
                  <span className="font-medium">{formatPrice(totalValue)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Trade Button */}
          <Button
            onClick={handleTrade}
            disabled={loading || numericAmount <= 0 || (!isBuy && numericAmount > maxSellAmount)}
            className="w-full"
          >
            {loading
              ? `${isBuy ? 'Buying' : 'Selling'}...`
              : `${isBuy ? 'Buy' : 'Sell'} ${coinSymbol}`
            }
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            This is a simulated trading environment for demo purposes.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}