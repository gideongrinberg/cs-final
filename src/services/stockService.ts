
import { generatePriceHistory, calculateChange } from '@/utils/stockUtils';

export interface Stock {
  ticker: string;
  name: string;
  price: number;
  change: number;
  percentChange: number;
  volume: number;
  marketCap: number;
}

export interface StockDetail extends Stock {
  high: number;
  low: number;
  open: number;
  previousClose: number;
  pe: number;
  dividend: number;
  description: string;
}

export interface PriceData {
  date: Date;
  price: number;
}

// Cache for price history data to maintain consistency
interface PriceHistoryCache {
  [key: string]: PriceData[];
}

const priceHistoryCache: PriceHistoryCache = {};

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

// Map of stock tickers to their descriptions
const stockDescriptions: Record<string, string> = {
  'AAPL': 'Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide.',
  'MSFT': 'Microsoft Corporation develops, licenses, and supports software, services, devices, and solutions worldwide.',
  'AMZN': 'Amazon.com, Inc. engages in the retail sale of consumer products and subscriptions in North America and internationally.',
  'GOOGL': 'Alphabet Inc. provides various products and platforms in the United States, Europe, the Middle East, Africa, and Asia Pacific.',
  'TSLA': 'Tesla, Inc. designs, develops, manufactures, leases, and sells electric vehicles, and energy generation and storage systems.',
  'META': 'Meta Platforms, Inc. engages in the development of products that enable people to connect through mobile devices, PCs, and other devices.',
  'NFLX': 'Netflix, Inc. provides entertainment services, offering TV series, documentaries, feature films, and mobile games across various genres and languages.',
  'DIS': 'The Walt Disney Company, together with its subsidiaries, operates as an entertainment company worldwide.'
};

// Generate detailed stock data
const generateStockDetails = (): Record<string, StockDetail> => {
  const details: Record<string, StockDetail> = {};
  
  popularStocks.forEach(stock => {
    const { ticker, price } = stock;
    const open = +(price * (1 + (Math.random() * 0.02 - 0.01))).toFixed(2);
    const high = +(Math.max(price, open) * (1 + Math.random() * 0.02)).toFixed(2);
    const low = +(Math.min(price, open) * (1 - Math.random() * 0.02)).toFixed(2);
    const previousClose = +(price - stock.change).toFixed(2);
    
    details[ticker] = {
      ...stock,
      high,
      low,
      open,
      previousClose,
      pe: +(Math.random() * 40 + 10).toFixed(2),
      dividend: +(Math.random() * 3).toFixed(2),
      description: stockDescriptions[ticker] || 'No description available.'
    };
  });
  
  return details;
};

const stockDetails = generateStockDetails();

// Generate a cache key for price history
const generatePriceHistoryCacheKey = (
  ticker: string,
  timeframe: string,
  resolution: string
): string => {
  return `${ticker}-${timeframe}-${resolution}`;
};

// Get the list of popular stocks
export const getPopularStocks = (): Stock[] => {
  return popularStocks.map(stock => {
    // Add some random movement to the price
    const newPrice = +(stock.price * (1 + (Math.random() * 0.04 - 0.02))).toFixed(2);
    const { change, percentChange } = calculateChange(newPrice, stock.price - stock.change);
    
    return {
      ...stock,
      price: newPrice,
      change,
      percentChange
    };
  });
};

// Get stock details by ticker
export const getStockByTicker = (ticker: string): StockDetail | undefined => {
  const stock = stockDetails[ticker];
  if (!stock) return undefined;
  
  // Add some random movement to the price
  const newPrice = +(stock.price * (1 + (Math.random() * 0.04 - 0.02))).toFixed(2);
  const { change, percentChange } = calculateChange(newPrice, stock.previousClose);
  
  return {
    ...stock,
    price: newPrice,
    change,
    percentChange
  };
};

// Get price history for a ticker and timeframe with resolution
export const getPriceHistory = (
  ticker: string,
  timeframe: '1D' | '1W' | '1M' | '1Y' | '5Y' = '1D',
  resolution: '1min' | '5min' | '15min' | '30min' | '1hour' | '1day' | '1week' = '1min'
): PriceData[] => {
  const cacheKey = generatePriceHistoryCacheKey(ticker, timeframe, resolution);
  
  // Return cached data if it exists
  if (priceHistoryCache[cacheKey]) {
    return priceHistoryCache[cacheKey];
  }
  
  const stock = popularStocks.find(s => s.ticker === ticker);
  if (!stock) return [];
  
  // Calculate days based on timeframe
  const days = timeframe === '1D' ? 1 :
               timeframe === '1W' ? 7 :
               timeframe === '1M' ? 30 :
               timeframe === '1Y' ? 365 : 1825;
  
  // Calculate data points based on resolution and timeframe
  let dataPoints: number;
  
  switch(resolution) {
    case '1min':
      dataPoints = days * 24 * 60;
      break;
    case '5min':
      dataPoints = Math.ceil(days * 24 * 60 / 5);
      break;
    case '15min':
      dataPoints = Math.ceil(days * 24 * 60 / 15);
      break;
    case '30min':
      dataPoints = Math.ceil(days * 24 * 60 / 30);
      break;
    case '1hour':
      dataPoints = days * 24;
      break;
    case '1day':
      dataPoints = days;
      break;
    case '1week':
      dataPoints = Math.ceil(days / 7);
      break;
    default:
      dataPoints = days * 24;
  }
  
  // Limit data points to a reasonable number for performance
  dataPoints = Math.min(dataPoints, 500);
  
  // For intraday timeframes with lower resolutions, adjust the data points
  if (timeframe === '1D' && resolution !== '1min') {
    const hoursInDay = 6.5; // Trading hours in a day
    switch(resolution) {
      case '5min':
        dataPoints = Math.ceil(hoursInDay * 60 / 5);
        break;
      case '15min':
        dataPoints = Math.ceil(hoursInDay * 60 / 15);
        break;
      case '30min':
        dataPoints = Math.ceil(hoursInDay * 60 / 30);
        break;
      case '1hour':
        dataPoints = Math.ceil(hoursInDay);
        break;
    }
  }
  
  // Calculate volatility based on timeframe and resolution
  let volatility = 0.02; // Default volatility
  
  if (resolution === '1min') {
    volatility = 0.005;
  } else if (resolution === '5min') {
    volatility = 0.008;
  } else if (resolution === '15min' || resolution === '30min') {
    volatility = 0.01;
  } else if (resolution === '1hour') {
    volatility = 0.015;
  } else if (resolution === '1day') {
    volatility = 0.02;
  } else if (resolution === '1week') {
    volatility = 0.03;
  }
  
  // Generate price history and store in cache
  const priceData = generatePriceHistory(ticker, days, dataPoints, stock.price, volatility);
  priceHistoryCache[cacheKey] = priceData;
  
  return priceData;
};

// Interface for portfolio holdings
export interface Holding {
  ticker: string;
  shares: number;
  averageCost: number;
}

// Interface for portfolio summary
export interface Portfolio {
  balance: number;
  holdings: Holding[];
  totalValue: number;
  totalProfit: number;
  totalProfitPercent: number;
}

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
    const stock = popularStocks.find(s => s.ticker === holding.ticker);
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
