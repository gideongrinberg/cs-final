
import React from 'react';
import StockList from '@/components/stocks/StockList';

const Watchlist = () => {
  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-bold mb-6">Watchlist</h1>
      <StockList title="Watchlist Stocks" showWatchlistActions={true} />
    </div>
  );
};

export default Watchlist;
