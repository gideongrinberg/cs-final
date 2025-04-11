
import React from 'react';
import StockList from '@/components/stocks/StockList';

const Markets = () => {
  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-bold mb-6">Markets</h1>
      <StockList title="All Stocks" />
    </div>
  );
};

export default Markets;
