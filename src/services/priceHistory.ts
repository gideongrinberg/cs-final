
import { PriceData, TimeFrame, Resolution } from './types/stockTypes';
import { generatePriceHistory } from '@/utils/stockUtils';
import { getPopularStocks } from './stockData';

// Cache for price history data to maintain consistency
interface PriceHistoryCache {
  [key: string]: PriceData[];
}

const priceHistoryCache: PriceHistoryCache = {};

// Generate a cache key for price history
const generatePriceHistoryCacheKey = (
  ticker: string,
  timeframe: TimeFrame,
  resolution: Resolution
): string => {
  return `${ticker}-${timeframe}-${resolution}`;
};

// Get price history for a ticker and timeframe with resolution
export const getPriceHistory = (
  ticker: string,
  timeframe: TimeFrame = '1D',
  resolution: Resolution = '1min'
): PriceData[] => {
  const cacheKey = generatePriceHistoryCacheKey(ticker, timeframe, resolution);
  
  // Return cached data if it exists
  if (priceHistoryCache[cacheKey]) {
    return priceHistoryCache[cacheKey];
  }
  
  const stock = getPopularStocks().find(s => s.ticker === ticker);
  if (!stock) return [];
  
  // Calculate days based on timeframe
  let days: number;
  
  // Handle minute and hour timeframes
  if (timeframe === '1m') {
    days = 1/24/60; // 1 minute in days
  } else if (timeframe === '5m') {
    days = 5/24/60; // 5 minutes in days
  } else if (timeframe === '15m') {
    days = 15/24/60; // 15 minutes in days
  } else if (timeframe === '30m') {
    days = 30/24/60; // 30 minutes in days
  } else if (timeframe === '1h') {
    days = 1/24; // 1 hour in days
  } else if (timeframe === '1D') {
    days = 1;
  } else if (timeframe === '5D') {
    days = 5;
  } else if (timeframe === '1W') {
    days = 7;
  } else if (timeframe === '1M') {
    days = 30;
  } else if (timeframe === '3M') {
    days = 90;
  } else if (timeframe === '6M') {
    days = 180;
  } else if (timeframe === '1Y') {
    days = 365;
  } else {
    days = 1825; // 5Y
  }
  
  // Calculate data points based on resolution and timeframe
  let dataPoints: number;
  
  switch(resolution) {
    case '1sec':
      dataPoints = Math.ceil(days * 24 * 60 * 60);
      break;
    case '5sec':
      dataPoints = Math.ceil(days * 24 * 60 * 60 / 5);
      break;
    case '30sec':
      dataPoints = Math.ceil(days * 24 * 60 * 60 / 30);
      break;
    case '1min':
      dataPoints = Math.ceil(days * 24 * 60);
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
      dataPoints = Math.ceil(days * 24);
      break;
    case '1day':
      dataPoints = Math.ceil(days);
      break;
    case '1week':
      dataPoints = Math.ceil(days / 7);
      break;
    default:
      dataPoints = Math.ceil(days * 24);
  }
  
  // Limit data points to a reasonable number for performance
  dataPoints = Math.min(dataPoints, 5000);
  
  // For intraday timeframes with lower resolutions, adjust the data points
  if (timeframe === '1D') {
    const hoursInDay = 6.5; // Trading hours in a day
    switch(resolution) {
      case '1sec':
        dataPoints = Math.ceil(hoursInDay * 60 * 60);
        break;
      case '5sec':
        dataPoints = Math.ceil(hoursInDay * 60 * 60 / 5);
        break;
      case '30sec':
        dataPoints = Math.ceil(hoursInDay * 60 * 60 / 30);
        break;
      case '1min':
        dataPoints = Math.ceil(hoursInDay * 60);
        break;
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
  } else if (timeframe === '5D' && (resolution === '1sec' || resolution === '5sec')) {
    // Handle 1sec and 5sec for 5D timeframe - limit to one trading day's worth of points per day
    const hoursInDay = 6.5;
    if (resolution === '1sec') {
      dataPoints = Math.ceil(hoursInDay * 60 * 60 * days);
    } else { // 5sec
      dataPoints = Math.ceil((hoursInDay * 60 * 60 / 5) * days);
    }
    dataPoints = Math.min(dataPoints, 5000); // Ensure we don't exceed our limit
  } else if (timeframe === '1W' && (resolution === '1sec' || resolution === '5sec')) {
    // Handle 1sec and 5sec for 1W timeframe - limit to reasonable amount
    const hoursInDay = 6.5;
    if (resolution === '1sec') {
      dataPoints = Math.ceil(hoursInDay * 60 * 60 * 3); // Just show 3 days worth at 1sec resolution
    } else { // 5sec
      dataPoints = Math.ceil((hoursInDay * 60 * 60 / 5) * 5); // 5 days worth at 5sec resolution
    }
    dataPoints = Math.min(dataPoints, 5000); // Ensure we don't exceed our limit
  } else if (['1m', '5m', '15m', '30m', '1h'].includes(timeframe)) {
    // For minute and hour timeframes, adjust data points for high resolution
    const minutesInTimeframe = timeframe === '1h' ? 60 : 
                               timeframe === '30m' ? 30 : 
                               timeframe === '15m' ? 15 : 
                               timeframe === '5m' ? 5 : 1;
    
    switch(resolution) {
      case '1sec':
        dataPoints = Math.ceil(minutesInTimeframe * 60);
        break;
      case '5sec':
        dataPoints = Math.ceil(minutesInTimeframe * 60 / 5);
        break;
      case '30sec':
        dataPoints = Math.ceil(minutesInTimeframe * 60 / 30);
        break;
      case '1min':
        dataPoints = Math.ceil(minutesInTimeframe);
        break;
      default:
        dataPoints = Math.max(10, Math.ceil(minutesInTimeframe / 5)); // Ensure at least 10 data points
    }
  }
  
  // Calculate volatility based on timeframe and resolution
  let volatility = 0.02; // Default volatility
  
  if (resolution === '1sec') {
    volatility = 0.0005; // Even smaller volatility for 1sec
  } else if (resolution === '5sec') {
    volatility = 0.001;
  } else if (resolution === '30sec') {
    volatility = 0.002;
  } else if (resolution === '1min') {
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
  
  // For minute timeframes, increase volatility slightly to make the chart more interesting
  if (['1m', '5m', '15m', '30m'].includes(timeframe)) {
    volatility *= 1.5;
  }
  
  // Generate price history and store in cache
  const priceData = generatePriceHistory(ticker, days, dataPoints, stock.price, volatility);
  priceHistoryCache[cacheKey] = priceData;
  
  return priceData;
};
