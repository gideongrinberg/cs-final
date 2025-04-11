
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PortfolioSummary from '@/components/dashboard/PortfolioSummary';
import { useStockContext } from '@/contexts/StockContext';
import { formatCurrency } from '@/utils/stockUtils';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { Link } from 'react-router-dom';

const Portfolio = () => {
  const { portfolio, stocks, orders } = useStockContext();

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-3xl font-bold">Portfolio</h1>
      
      <PortfolioSummary />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Holdings</CardTitle>
          </CardHeader>
          <CardContent>
            {portfolio.holdings.length === 0 ? (
              <p className="text-center py-6 text-muted-foreground">No holdings yet</p>
            ) : (
              <div className="space-y-4">
                {portfolio.holdings.map((holding) => {
                  const stock = stocks.find(s => s.ticker === holding.ticker);
                  if (!stock) return null;
                  
                  const currentValue = stock.price * holding.shares;
                  const costBasis = holding.averageCost * holding.shares;
                  const profitLoss = currentValue - costBasis;
                  const profitLossPercent = (profitLoss / costBasis) * 100;
                  
                  return (
                    <div key={holding.ticker} className="p-4 rounded-lg border">
                      <div className="flex justify-between items-center">
                        <div>
                          <Link to={`/stocks/${holding.ticker}`} className="text-lg font-semibold hover:text-primary">{holding.ticker}</Link>
                          <p className="text-sm text-muted-foreground">{holding.shares} shares @ {formatCurrency(holding.averageCost)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold">{formatCurrency(currentValue)}</p>
                          <p className={`text-sm flex items-center justify-end ${profitLoss >= 0 ? 'text-success' : 'text-danger'}`}>
                            {profitLoss >= 0 ? <ArrowUp className="h-3 w-3 mr-1" /> : <ArrowDown className="h-3 w-3 mr-1" />}
                            {formatCurrency(profitLoss)} ({profitLossPercent.toFixed(2)}%)
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <p className="text-center py-6 text-muted-foreground">No orders yet</p>
            ) : (
              <div className="space-y-4">
                {orders.slice(0, 5).map((order, index) => (
                  <div key={index} className="p-4 rounded-lg border">
                    <div className="flex justify-between items-center">
                      <div>
                        <Link to={`/stocks/${order.ticker}`} className="text-lg font-semibold hover:text-primary">{order.ticker}</Link>
                        <p className="text-sm text-muted-foreground">
                          {order.type === 'buy' ? 'Bought' : 'Sold'} {order.shares} shares @ {formatCurrency(order.price)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold">{formatCurrency(order.shares * order.price)}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(order.timestamp).toLocaleDateString()} {new Date(order.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Portfolio;
