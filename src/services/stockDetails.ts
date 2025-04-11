
import { Stock, StockDetail } from './types/stockTypes';
import { getPopularStocks } from './stockData';
import { calculateChange } from '@/utils/stockUtils';

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
  
  getPopularStocks().forEach(stock => {
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
