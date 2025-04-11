
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getStockByTicker } from '@/services/stockService';
import { formatCurrency } from '@/utils/stockUtils';
import StockChart from '@/components/charts/StockChart';
import OrderForm from '@/components/trading/OrderForm';
import { StockDetail as StockDetailType } from '@/services/stockService';

const StockDetail = () => {
  const { ticker = '' } = useParams();
  const navigate = useNavigate();
  const [stock, setStock] = useState<StockDetailType | null>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!stock) {
    return <div>Stock not found</div>;
  }

  return (
    <div className="animate-fade-in">
      <Button variant="outline" size="sm" onClick={() => navigate(-1)} className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-2" /> Back
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <StockChart 
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
