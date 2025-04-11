
import { Portfolio, Holding } from './types/stockTypes';
import { getPopularStocks } from './stockData';

// Get initial portfolio (simulated)
export const getInitialPortfolio = (): Portfolio => {
  const holdings: Holding[] = [
    { ticker: 'AAPL', shares: 10, averageCost: 160.42 },
    { ticker: 'MSFT', shares: 5, averageCost: 320.18 },
    { ticker: 'TSLA', shares: 8, averageCost: 250.75 }
  ];
  
  const balance = 10000; // Cash balance
  let totalValue = balance;
  let totalCost = 0;
  
  // Calculate current value of holdings
  holdings.forEach(holding => {
    const stock = getPopularStocks().find(s => s.ticker === holding.ticker);
    if (stock) {
      totalValue += stock.price * holding.shares;
      totalCost += holding.averageCost * holding.shares;
    }
  });
  
  const totalProfit = totalValue - balance - totalCost;
  const totalProfitPercent = (totalProfit / totalCost) * 100;
  
  return {
    balance,
    holdings,
    totalValue,
    totalProfit,
    totalProfitPercent
  };
};
