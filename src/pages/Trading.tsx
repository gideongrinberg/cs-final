
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { useStockContext } from '@/contexts/StockContext';
import { useNavigate } from 'react-router-dom';

const Trading = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { stocks } = useStockContext();
  const navigate = useNavigate();
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm) return;
    
    const foundStock = stocks.find(s => 
      s.ticker.toUpperCase() === searchTerm.toUpperCase() || 
      s.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    if (foundStock) {
      navigate(`/stocks/${foundStock.ticker}`);
    }
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-3xl font-bold">Trading</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Find a Stock to Trade</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              placeholder="Search by ticker or company name..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Button type="submit">
              <Search className="h-4 w-4 mr-2" /> Search
            </Button>
          </form>
          
          <div className="mt-6">
            <h3 className="font-semibold mb-4">Popular Stocks to Trade</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {stocks.slice(0, 8).map(stock => (
                <button
                  key={stock.ticker}
                  onClick={() => navigate(`/stocks/${stock.ticker}`)}
                  className="p-4 border rounded-lg hover:bg-secondary/50 transition-colors"
                >
                  <div className="h-8 w-8 bg-secondary rounded-md flex items-center justify-center mb-2">
                    {stock.ticker.slice(0, 1)}
                  </div>
                  <p className="font-semibold">{stock.ticker}</p>
                  <p className="text-sm text-muted-foreground truncate">{stock.name}</p>
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Trading;
