
import React from 'react';
import MarketOverview from '@/components/dashboard/MarketOverview';
import PortfolioSummary from '@/components/dashboard/PortfolioSummary';
import StockList from '@/components/stocks/StockList';

const Dashboard = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MarketOverview />
        <PortfolioSummary />
      </div>
      
      <StockList title="Popular Stocks" />
    </div>
  );
};

export default Dashboard;
