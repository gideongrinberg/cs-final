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
  price?: number;    // Used for simple line charts
  open?: number;     // For OHLC/candlestick
  high?: number;     // For OHLC/candlestick
  low?: number;      // For OHLC/candlestick
  close?: number;    // For OHLC/candlestick
  volume?: number;   // Trading volume
}

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

// Helper to determine appropriate data points based on timeframe and resolution
const getDataPointCount = (
  timeframe: string,
  resolution: string
): { days: number; dataPoints: number } => {
  let days: number;
  let dataPoints: number;
  
  // Determine days based on timeframe
  switch (timeframe) {
    case '1D': days = 1; break;
    case '1W': days = 7; break;
    case '1M': days = 30; break;
    case '3M': days = 90; break;
    case '1Y': days = 365; break;
    case '5Y': days = 1825; break;
    default: days = 1;
  }
  
  // Determine data points based on resolution and timeframe
  switch (resolution) {
    case '1m':
      dataPoints = days === 1 ? 390 : 0; // Market hours in minutes (6.5 hours * 60)
      break;
    case '5m':
      dataPoints = days === 1 ? 78 : (days <= 7 ? 78 * days : 0); // 6.5 hours / 5 minutes
      break;
    case '15m':
      dataPoints = days === 1 ? 26 : (days <= 30 ? Math.min(26 * days, 1000) : 0);
      break;
    case '30m':
      dataPoints = days === 1 ? 13 : (days <= 90 ? Math.min(13 * days, 1000) : 0);
      break;
    case '1h':
      dataPoints = days === 1 ? 7 : Math.min(7 * days, 1000);
      break;
    case '1d':
      dataPoints = days;
      break;
    default:
      dataPoints = days;
  }
  
  // Ensure a reasonable number of data points
  dataPoints = Math.min(dataPoints, 1000);
  
  return { days, dataPoints };
};

// Generate OHLC data
const generateOHLCData = (
  ticker: string,
  days: number,
  dataPoints: number,
  basePrice: number,
  volatility: number
): PriceData[] => {
  const now = new Date();
  const result: PriceData[] = [];
  
  // Start price is the base price adjusted by a small random amount
  let prevClose = basePrice * (1 + (Math.random() * 0.02 - 0.01));
  
  // Time interval between data points in milliseconds
  const interval = days * 24 * 60 * 60 * 1000 / dataPoints;
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  const marketOpenHour = 9.5; // 9:30 AM
  const marketCloseHour = 16; // 4:00 PM
  const hoursPerDay = marketCloseHour - marketOpenHour;
  
  // Generate data points
  for (let i = dataPoints - 1; i >= 0; i--) {
    // Calculate the date for this data point
    let timestamp = new Date(now.getTime() - i * interval);
    
    // For intraday data, only include market hours
    if (days === 1) {
      const hour = marketOpenHour + (i / dataPoints) * hoursPerDay;
      timestamp = new Date(now.setHours(Math.floor(hour), (hour % 1) * 60, 0, 0));
    }
    
    // If this is daily data, fix time to market close
    if (interval >= millisecondsPerDay) {
      timestamp = new Date(timestamp.setHours(16, 0, 0, 0));
    }
    
    // Skip weekends for non-intraday data
    if (interval >= millisecondsPerDay) {
      const day = timestamp.getDay();
      if (day === 0 || day === 6) {
        continue;
      }
    }
    
    // Generate OHLC values with realistic patterns
    const dayVolatility = volatility * (0.8 + Math.random() * 0.4); // Randomize volatility slightly
    const range = prevClose * dayVolatility;
    
    // Create some patterns like gaps up/down and trending days
    const trend = Math.random() > 0.5 ? 1 : -1; // Randomly decide trend direction
    const trendStrength = Math.random() * 0.6 + 0.2; // Random trend strength between 0.2 and 0.8
    
    let open = i === dataPoints - 1 ? prevClose : prevClose * (1 + (Math.random() * 0.01 - 0.005));
    let close = open * (1 + trend * trendStrength * dayVolatility);
    
    // Ensure high is higher than both open and close
    const highAboveMax = Math.max(open, close) * (1 + Math.random() * dayVolatility * 0.5);
    
    // Ensure low is lower than both open and close
    const lowBelowMin = Math.min(open, close) * (1 - Math.random() * dayVolatility * 0.5);
    
    const high = highAboveMax;
    const low = lowBelowMin;
    
    // Generate volume that correlates with price movement (higher volume on bigger moves)
    const priceMove = Math.abs(close - open) / open;
    const baseVolume = Math.floor(Math.random() * 200000) + 100000; // Base volume between 100K and 300K
    const volumeMultiplier = 1 + priceMove * 20; // More volume on bigger moves
    const volume = Math.floor(baseVolume * volumeMultiplier);
    
    result.push({
      date: timestamp,
      open,
      high,
      low,
      close,
      volume,
      price: close // For backward compatibility
    });
    
    prevClose = close;
  }
  
  return result;
};

// Get price history for a ticker and timeframe
export const getPriceHistory = (
  ticker: string,
  timeframe: '1D' | '1W' | '1M' | '3M' | '1Y' | '5Y' = '1D',
  resolution: '1m' | '5m' | '15m' | '30m' | '1h' | '1d' = '1d'
): PriceData[] => {
  const stock = popularStocks.find(s => s.ticker === ticker);
  if (!stock) return [];
  
  const { days, dataPoints } = getDataPointCount(timeframe, resolution);
  
  if (dataPoints === 0) {
    // If the resolution doesn't make sense for the timeframe, fall back to a sensible default
    if (timeframe === '1D') return getPriceHistory(ticker, timeframe, '5m');
    if (timeframe === '1W') return getPriceHistory(ticker, timeframe, '30m');
    if (timeframe === '1M') return getPriceHistory(ticker, timeframe, '1h');
    return getPriceHistory(ticker, timeframe, '1d');
  }
  
  // Different stocks have different volatility
  const volatilityMap: {[key: string]: number} = {
    'TSLA': 0.04, // High volatility
    'META': 0.03,
    'AMZN': 0.025,
    'NFLX': 0.03,
    'AAPL': 0.018, // Lower volatility
    'MSFT': 0.015,
    'GOOGL': 0.02,
    'DIS': 0.022
  };
  
  const volatility = volatilityMap[ticker] || 0.02;
  
  return generateOHLCData(ticker, days, dataPoints, stock.price, volatility);
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
