
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowDown, ArrowUp, DollarSign, Percent, TrendingUp } from 'lucide-react';
import { formatCurrency } from '@/utils/stockUtils';
import { useStockContext } from '@/contexts/StockContext';

const PortfolioSummary = () => {
  const { portfolio, stocks } = useStockContext();
  
  // Calculate day change
  const calculateDayChange = () => {
    let dayChange = 0;
    let dayChangePercent = 0;
    
    portfolio.holdings.forEach(holding => {
      const stock = stocks.find(s => s.ticker === holding.ticker);
      if (stock) {
        dayChange += stock.change * holding.shares;
      }
    });
    
    if (portfolio.totalValue > 0) {
      dayChangePercent = (dayChange / portfolio.totalValue) * 100;
    }
    
    return {
      dayChange: +dayChange.toFixed(2),
      dayChangePercent: +dayChangePercent.toFixed(2)
    };
  };
  
  const { dayChange, dayChangePercent } = calculateDayChange();
  
  const metrics = [
    {
      title: 'Portfolio Value',
      value: formatCurrency(portfolio.totalValue),
      icon: DollarSign,
      change: dayChange,
      changePercent: dayChangePercent
    },
    {
      title: 'Total Return',
      value: formatCurrency(portfolio.totalProfit),
      icon: TrendingUp,
      change: portfolio.totalProfitPercent,
      isPercent: true
    },
    {
      title: 'Cash Balance',
      value: formatCurrency(portfolio.balance),
      icon: DollarSign
    }
  ];
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Portfolio Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {metrics.map((metric) => (
            <div key={metric.title} className="p-4 rounded-lg border">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-muted-foreground">{metric.title}</p>
                <metric.icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-2xl font-bold">{metric.value}</p>
              {metric.change !== undefined && (
                <div className={`flex items-center text-sm ${metric.change >= 0 ? 'text-success' : 'text-danger'}`}>
                  {metric.change >= 0 ? <ArrowUp className="h-4 w-4 mr-1" /> : <ArrowDown className="h-4 w-4 mr-1" />}
                  <span>
                    {metric.change >= 0 ? '+' : ''}{metric.change}
                    {metric.isPercent ? '%' : ` (${metric.changePercent}%)`}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="mt-6">
          <h3 className="font-semibold mb-2">Your Holdings</h3>
          <div className="grid grid-cols-1 gap-2">
            {portfolio.holdings.map((holding) => {
              const stock = stocks.find(s => s.ticker === holding.ticker);
              if (!stock) return null;
              
              const currentValue = stock.price * holding.shares;
              const costBasis = holding.averageCost * holding.shares;
              const profitLoss = currentValue - costBasis;
              const profitLossPercent = (profitLoss / costBasis) * 100;
              
              return (
                <div key={holding.ticker} className="flex justify-between items-center p-3 rounded-md border">
                  <div className="flex items-center space-x-2">
                    <div className="h-8 w-8 bg-secondary rounded-md flex items-center justify-center">
                      {holding.ticker.slice(0, 1)}
                    </div>
                    <div>
                      <p className="font-medium">{holding.ticker}</p>
                      <p className="text-sm text-muted-foreground">{holding.shares} shares</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(currentValue)}</p>
                    <p className={`text-sm ${profitLoss >= 0 ? 'text-success' : 'text-danger'}`}>
                      {profitLoss >= 0 ? '+' : ''}{formatCurrency(profitLoss)} ({profitLossPercent.toFixed(2)}%)
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PortfolioSummary;
