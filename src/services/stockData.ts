import { Stock } from './types/stockTypes';
import { calculateChange } from '@/utils/stockUtils';

// Keep track of daily price basis to ensure consistent daily changes
const dailyPriceBasis: Record<string, { previousClose: number, dayStart: Date }> = {};

// Check if we need to reset daily basis (new day)
const resetDailyBasisIfNeeded = () => {
  const now = new Date();
  const today = now.toDateString();
  
  Object.keys(dailyPriceBasis).forEach(ticker => {
    const { dayStart } = dailyPriceBasis[ticker];
    if (dayStart.toDateString() !== today) {
      // It's a new day, reset the basis with the last known price
      delete dailyPriceBasis[ticker];
    }
  });
};

// Simulated stock data
const popularStocks: Stock[] = [
  {
    ticker: 'AAPL',
    name: 'Apple Inc.',
    price: 178.42,
    change: 3.26,
    percentChange: 1.86,
    volume: 45_302_100,
    marketCap: 2_800_000_000_000
  },
  {
    ticker: 'MSFT',
    name: 'Microsoft Corporation',
    price: 346.75,
    change: 2.35,
    percentChange: 0.68,
    volume: 17_240_300,
    marketCap: 2_580_000_000_000
  },
  {
    ticker: 'AMZN',
    name: 'Amazon.com Inc.',
    price: 127.74,
    change: -0.48,
    percentChange: -0.37,
    volume: 31_250_400,
    marketCap: 1_323_000_000_000
  },
  {
    ticker: 'GOOGL',
    name: 'Alphabet Inc.',
    price: 136.19,
    change: 1.72,
    percentChange: 1.28,
    volume: 14_125_200,
    marketCap: 1_720_000_000_000
  },
  {
    ticker: 'TSLA',
    name: 'Tesla Inc.',
    price: 237.49,
    change: -5.26,
    percentChange: -2.17,
    volume: 115_420_700,
    marketCap: 753_000_000_000
  },
  {
    ticker: 'META',
    name: 'Meta Platforms Inc.',
    price: 302.55,
    change: 6.14,
    percentChange: 2.07,
    volume: 21_340_900,
    marketCap: 778_000_000_000
  },
  {
    ticker: 'NFLX',
    name: 'Netflix Inc.',
    price: 398.69,
    change: 7.82,
    percentChange: 2.00,
    volume: 5_230_100,
    marketCap: 176_000_000_000
  },
  {
    ticker: 'DIS',
    name: 'The Walt Disney Company',
    price: 84.72,
    change: -1.05,
    percentChange: -1.23,
    volume: 12_345_600,
    marketCap: 155_000_000_000
  }
];

// Get the list of popular stocks
export const getPopularStocks = (): Stock[] => {
  // Check if we need to reset for a new day
  resetDailyBasisIfNeeded();
  
  return popularStocks.map(stock => {
    // Initialize daily basis if not already done for this stock
    if (!dailyPriceBasis[stock.ticker]) {
      dailyPriceBasis[stock.ticker] = {
        previousClose: stock.price - stock.change, // Use the initial daily change
        dayStart: new Date()
      };
    }
    
    // Add some random movement to the price
    const newPrice = +(stock.price * (1 + (Math.random() * 0.04 - 0.02))).toFixed(2);
    
    // Calculate change against the previous close, not the last tick
    const { change, percentChange } = calculateChange(
      newPrice, 
      dailyPriceBasis[stock.ticker].previousClose
    );
    
    return {
      ...stock,
      price: newPrice,
      change,
      percentChange
    };
  });
};
