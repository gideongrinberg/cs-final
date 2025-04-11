
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
  },
  // Adding 20 more stocks
  {
    ticker: 'NVDA',
    name: 'NVIDIA Corporation',
    price: 941.27,
    change: 24.35,
    percentChange: 2.66,
    volume: 42_631_400,
    marketCap: 2_320_000_000_000
  },
  {
    ticker: 'JPM',
    name: 'JPMorgan Chase & Co.',
    price: 189.15,
    change: -0.87,
    percentChange: -0.46,
    volume: 9_234_500,
    marketCap: 545_000_000_000
  },
  {
    ticker: 'V',
    name: 'Visa Inc.',
    price: 273.48,
    change: 1.85,
    percentChange: 0.68,
    volume: 7_843_200,
    marketCap: 567_000_000_000
  },
  {
    ticker: 'WMT',
    name: 'Walmart Inc.',
    price: 67.81,
    change: 0.97,
    percentChange: 1.45,
    volume: 8_732_400,
    marketCap: 546_000_000_000
  },
  {
    ticker: 'PG',
    name: 'Procter & Gamble Co.',
    price: 164.25,
    change: 0.52,
    percentChange: 0.32,
    volume: 5_487_300,
    marketCap: 387_000_000_000
  },
  {
    ticker: 'MA',
    name: 'Mastercard Incorporated',
    price: 458.12,
    change: 3.24,
    percentChange: 0.71,
    volume: 2_843_700,
    marketCap: 429_000_000_000
  },
  {
    ticker: 'HD',
    name: 'The Home Depot, Inc.',
    price: 345.78,
    change: -2.32,
    percentChange: -0.67,
    volume: 3_954_200,
    marketCap: 342_000_000_000
  },
  {
    ticker: 'PYPL',
    name: 'PayPal Holdings, Inc.',
    price: 63.82,
    change: -1.25,
    percentChange: -1.92,
    volume: 12_342_800,
    marketCap: 68_000_000_000
  },
  {
    ticker: 'INTC',
    name: 'Intel Corporation',
    price: 32.47,
    change: 0.87,
    percentChange: 2.75,
    volume: 45_324_600,
    marketCap: 137_000_000_000
  },
  {
    ticker: 'AMD',
    name: 'Advanced Micro Devices, Inc.',
    price: 157.41,
    change: 5.26,
    percentChange: 3.46,
    volume: 53_423_100,
    marketCap: 254_000_000_000
  },
  {
    ticker: 'CRM',
    name: 'Salesforce, Inc.',
    price: 253.87,
    change: 1.35,
    percentChange: 0.53,
    volume: 6_784_200,
    marketCap: 246_000_000_000
  },
  {
    ticker: 'ADBE',
    name: 'Adobe Inc.',
    price: 489.95,
    change: -3.47,
    percentChange: -0.70,
    volume: 3_485_600,
    marketCap: 219_000_000_000
  },
  {
    ticker: 'CSCO',
    name: 'Cisco Systems, Inc.',
    price: 48.52,
    change: 0.34,
    percentChange: 0.71,
    volume: 18_534_200,
    marketCap: 197_000_000_000
  },
  {
    ticker: 'KO',
    name: 'The Coca-Cola Company',
    price: 62.34,
    change: -0.18,
    percentChange: -0.29,
    volume: 12_543_700,
    marketCap: 269_000_000_000
  },
  {
    ticker: 'PEP',
    name: 'PepsiCo, Inc.',
    price: 172.31,
    change: 0.86,
    percentChange: 0.50,
    volume: 5_634_800,
    marketCap: 237_000_000_000
  },
  {
    ticker: 'NKE',
    name: 'NIKE, Inc.',
    price: 93.76,
    change: -1.24,
    percentChange: -1.31,
    volume: 9_876_500,
    marketCap: 142_000_000_000
  },
  {
    ticker: 'MCD',
    name: "McDonald's Corporation",
    price: 257.82,
    change: 2.15,
    percentChange: 0.84,
    volume: 3_426_700,
    marketCap: 186_000_000_000
  },
  {
    ticker: 'SBUX',
    name: 'Starbucks Corporation',
    price: 75.93,
    change: -1.46,
    percentChange: -1.89,
    volume: 10_432_600,
    marketCap: 86_000_000_000
  },
  {
    ticker: 'TXN',
    name: 'Texas Instruments Incorporated',
    price: 169.43,
    change: 3.28,
    percentChange: 1.97,
    volume: 5_324_700,
    marketCap: 154_000_000_000
  },
  {
    ticker: 'BAC',
    name: 'Bank of America Corporation',
    price: 37.95,
    change: -0.58,
    percentChange: -1.51,
    volume: 42_654_300,
    marketCap: 298_000_000_000
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
