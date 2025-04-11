
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { formatCurrency, formatPercentage } from '@/utils/stockUtils';
import { useStockContext } from '@/contexts/StockContext';
import { Skeleton } from '@/components/ui/skeleton';

const MarketOverview = () => {
  const { stocks, loadingStocks } = useStockContext();

  const marketIndexes = [
    { name: 'S&P 500', value: 4395.24, change: 0.28 },
    { name: 'Dow Jones', value: 34678.42, change: -0.12 },
    { name: 'NASDAQ', value: 13714.54, change: 0.61 },
    { name: 'Russell 2000', value: 2026.32, change: -0.22 }
  ];

  // Get daily top movers instead of tick-by-tick movers
  const getDailyTopMovers = () => {
    if (!stocks.length) return [];
    
    return [...stocks]
      .sort((a, b) => Math.abs(b.change) - Math.abs(a.change))
      .slice(0, 3);
  };

  const topMovers = getDailyTopMovers();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Market Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {marketIndexes.map((index) => (
            <div key={index.name} className="p-2">
              <p className="text-sm font-medium">{index.name}</p>
              <p className="text-xl font-bold">{formatCurrency(index.value)}</p>
              <div className={`flex items-center text-sm ${index.change >= 0 ? 'text-success' : 'text-danger'}`}>
                {index.change >= 0 ? <ArrowUp className="h-4 w-4 mr-1" /> : <ArrowDown className="h-4 w-4 mr-1" />}
                <span>{index.change}%</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <h3 className="font-semibold mb-2">Top Daily Movers</h3>
          <div className="grid grid-cols-1 gap-2">
            {loadingStocks ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="flex justify-between items-center p-3 rounded-md border">
                  <div className="flex items-center space-x-2">
                    <Skeleton className="h-8 w-8 rounded-md" />
                    <div>
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-3 w-24 mt-1" />
                    </div>
                  </div>
                  <div className="text-right">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-3 w-12 mt-1" />
                  </div>
                </div>
              ))
            ) : (
              topMovers.map((stock) => (
                <div key={stock.ticker} className="flex justify-between items-center p-3 rounded-md border">
                  <div className="flex items-center space-x-2">
                    <div className="h-8 w-8 bg-secondary rounded-md flex items-center justify-center">
                      {stock.ticker.slice(0, 1)}
                    </div>
                    <div>
                      <p className="font-medium">{stock.ticker}</p>
                      <p className="text-sm text-muted-foreground">{stock.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(stock.price)}</p>
                    <p className={`text-sm ${stock.change >= 0 ? 'text-success' : 'text-danger'}`}>
                      {stock.change >= 0 ? '+' : ''}{formatCurrency(stock.change)} ({stock.percentChange}%)
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MarketOverview;
