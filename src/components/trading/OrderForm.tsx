
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatCurrency } from '@/utils/stockUtils';
import { useStockContext } from '@/contexts/StockContext';

interface OrderFormProps {
  ticker: string;
  price: number;
  onComplete?: () => void;
}

const OrderForm: React.FC<OrderFormProps> = ({ ticker, price, onComplete }) => {
  const [tab, setTab] = useState<'buy' | 'sell'>('buy');
  const [shares, setShares] = useState<string>('1');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { portfolio, executeOrder } = useStockContext();
  
  const handleSharesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow only numbers and empty string
    const value = e.target.value.replace(/[^0-9]/g, '');
    setShares(value === '' ? '' : value);
  };
  
  const parseShares = (): number => {
    const parsedShares = parseInt(shares);
    return isNaN(parsedShares) ? 0 : parsedShares;
  };
  
  const totalAmount = parseShares() * price;
  const canBuy = totalAmount <= portfolio.balance && parseShares() > 0;
  
  const holding = portfolio.holdings.find(h => h.ticker === ticker);
  const sharesOwned = holding?.shares || 0;
  const canSell = parseShares() <= sharesOwned && parseShares() > 0;
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const parsedShares = parseShares();
    if (parsedShares <= 0) return;
    
    setIsSubmitting(true);
    
    try {
      const success = await executeOrder(ticker, parsedShares, tab);
      if (success && onComplete) {
        onComplete();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Place an Order</CardTitle>
      </CardHeader>
      <Tabs value={tab} onValueChange={(value) => setTab(value as 'buy' | 'sell')}>
        <TabsList className="grid grid-cols-2 mx-4">
          <TabsTrigger value="buy">Buy</TabsTrigger>
          <TabsTrigger value="sell">Sell</TabsTrigger>
        </TabsList>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="p-4">
            <TabsContent value="buy" className="mt-0">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="shares-buy">Shares</Label>
                  <Input
                    id="shares-buy"
                    type="text"
                    value={shares}
                    onChange={handleSharesChange}
                    placeholder="Enter number of shares"
                    className="mt-1"
                  />
                </div>
                <div className="flex justify-between text-sm">
                  <span>Market Price</span>
                  <span>{formatCurrency(price)}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Estimated Cost</span>
                  <span>{formatCurrency(totalAmount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Available Cash</span>
                  <span>{formatCurrency(portfolio.balance)}</span>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="sell" className="mt-0">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="shares-sell">Shares</Label>
                  <Input
                    id="shares-sell"
                    type="text"
                    value={shares}
                    onChange={handleSharesChange}
                    placeholder="Enter number of shares"
                    className="mt-1"
                  />
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shares Owned</span>
                  <span>{sharesOwned}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Market Price</span>
                  <span>{formatCurrency(price)}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Estimated Value</span>
                  <span>{formatCurrency(totalAmount)}</span>
                </div>
              </div>
            </TabsContent>
          </CardContent>
          
          <CardFooter className="px-4 pb-4">
            <Button 
              type="submit" 
              className="w-full" 
              disabled={
                (tab === 'buy' && !canBuy) || 
                (tab === 'sell' && !canSell) ||
                isSubmitting
              }
            >
              {isSubmitting ? 'Processing...' : `${tab === 'buy' ? 'Buy' : 'Sell'} ${ticker}`}
            </Button>
          </CardFooter>
        </form>
      </Tabs>
    </Card>
  );
};

export default OrderForm;
