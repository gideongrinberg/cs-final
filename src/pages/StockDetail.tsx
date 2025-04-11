
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getStockByTicker } from '@/services/stockService';
import { formatCurrency } from '@/utils/stockUtils';
import CandlestickChart from '@/components/charts/CandlestickChart';
import OrderForm from '@/components/trading/OrderForm';
import { StockDetail as StockDetailType } from '@/services/stockService';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

const StockDetail = () => {
  const { ticker = '' } = useParams();
  const navigate = useNavigate();
  const [stock, setStock] = useState<StockDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch initial stock data
  useEffect(() => {
    if (ticker) {
      const stockData = getStockByTicker(ticker);
      if (stockData) {
        setStock(stockData);
      } else {
        navigate('/not-found');
      }
    }
    setLoading(false);
  }, [ticker, navigate]);

  // Set up periodic refresh of stock data
  useEffect(() => {
    if (!ticker) return;
    
    const refreshInterval = setInterval(() => {
      setIsRefreshing(true);
      const updatedStock = getStockByTicker(ticker);
      if (updatedStock) {
        setStock(updatedStock);
        toast.info(`${ticker} data refreshed`);
      }
      setTimeout(() => setIsRefreshing(false), 500);
    }, 30000); // Changed from 5000 to 30000 (30 seconds) to reduce frequent updates
    
    return () => clearInterval(refreshInterval);
  }, [ticker]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-24" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Skeleton className="h-[400px] w-full" />
            <Skeleton className="h-[300px] w-full mt-6" />
          </div>
          <Skeleton className="h-[400px] w-full" />
        </div>
      </div>
    );
  }

  if (!stock) {
    return <div>Stock not found</div>;
  }

  const isPositive = stock.percentChange >= 0;

  return (
    <div className="animate-fade-in">
      <Button variant="outline" size="sm" onClick={() => navigate(-1)} className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-2" /> Back
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold flex items-center">
                    {ticker}
                    {isRefreshing && (
                      <span className="ml-2 inline-block h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                    )}
                  </h2>
                  <p className="text-sm text-muted-foreground">{stock.name}</p>
                </div>
                <div className="mt-2 xs:mt-0">
                  <p className="text-xl font-bold">{formatCurrency(stock.price)}</p>
                  <p className={`text-sm ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                    {isPositive ? '+' : ''}{formatCurrency(stock.change)} ({stock.percentChange.toFixed(2)}%)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <CandlestickChart 
            ticker={stock.ticker} 
            stockName={stock.name}
            currentPrice={stock.price}
            change={stock.change}
            percentChange={stock.percentChange}
          />

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Company Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{stock.description}</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                {[
                  { label: 'Open', value: formatCurrency(stock.open) },
                  { label: 'High', value: formatCurrency(stock.high) },
                  { label: 'Low', value: formatCurrency(stock.low) },
                  { label: 'Previous Close', value: formatCurrency(stock.previousClose) },
                  { label: 'Volume', value: stock.volume.toLocaleString() },
                  { label: 'Market Cap', value: (stock.marketCap / 1e9).toFixed(2) + 'B' },
                  { label: 'P/E Ratio', value: stock.pe.toFixed(2) },
                  { label: 'Dividend Yield', value: stock.dividend.toFixed(2) + '%' }
                ].map((item) => (
                  <div key={item.label} className="border rounded-md p-3">
                    <p className="text-sm text-muted-foreground">{item.label}</p>
                    <p className="text-lg font-semibold">{item.value}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <OrderForm ticker={stock.ticker} price={stock.price} />
        </div>
      </div>
    </div>
  );
};

export default StockDetail;
