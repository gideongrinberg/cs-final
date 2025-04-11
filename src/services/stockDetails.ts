
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
  'DIS': 'The Walt Disney Company, together with its subsidiaries, operates as an entertainment company worldwide.',
  // Adding descriptions for new stocks
  'NVDA': 'NVIDIA Corporation designs and manufactures graphics processing units (GPUs) and system-on-chip units (SOCs) for gaming, professional visualization, data center, and automotive markets.',
  'JPM': 'JPMorgan Chase & Co. is a global financial services firm that offers investment banking, financial services for consumers and small businesses, commercial banking, and asset management.',
  'V': 'Visa Inc. operates as a payments technology company worldwide, facilitating digital payments among consumers, merchants, financial institutions, and government entities.',
  'WMT': 'Walmart Inc. engages in retail and wholesale operations, operating supercenters, supermarkets, hypermarkets, warehouse clubs, and discount stores worldwide.',
  'PG': 'The Procter & Gamble Company provides branded consumer packaged goods worldwide, including beauty, grooming, health care, fabric care, and home care products.',
  'MA': 'Mastercard Incorporated is a technology company in the global payments industry, providing transaction processing and other payment-related services.',
  'HD': 'The Home Depot, Inc. operates home improvement retail stores, selling building materials, home improvement products, and lawn and garden products.',
  'PYPL': 'PayPal Holdings, Inc. operates as a technology platform company that enables digital and mobile payments on behalf of consumers and merchants worldwide.',
  'INTC': 'Intel Corporation designs, manufactures, and sells computer products and technologies that deliver networking, data storage, and communications platforms.',
  'AMD': 'Advanced Micro Devices, Inc. operates as a semiconductor company worldwide, providing microprocessors, chipsets, GPUs, and other products.',
  'CRM': 'Salesforce, Inc. provides customer relationship management technology that brings companies and customers together worldwide.',
  'ADBE': 'Adobe Inc. provides digital marketing and media solutions worldwide, offering creative, document, and experience cloud services.',
  'CSCO': 'Cisco Systems, Inc. designs, manufactures, and sells Internet Protocol based networking and other products related to the communications and IT industry.',
  'KO': 'The Coca-Cola Company manufactures, markets, and sells various nonalcoholic beverages worldwide, including sparkling soft drinks, water, and juice.',
  'PEP': 'PepsiCo, Inc. manufactures, markets, distributes, and sells beverages and convenient foods worldwide, including brands like Pepsi, Gatorade, and Lay\'s.',
  'NKE': 'NIKE, Inc. designs, develops, markets, and sells athletic footwear, apparel, equipment, accessories, and services worldwide.',
  'MCD': 'McDonald\'s Corporation operates and franchises restaurants worldwide, serving a locally-relevant menu of food and beverages.',
  'SBUX': 'Starbucks Corporation operates as a roaster, marketer, and retailer of specialty coffee worldwide, with thousands of retail stores.',
  'TXN': 'Texas Instruments Incorporated designs, manufactures, and sells semiconductors to electronics designers and manufacturers worldwide.',
  'BAC': 'Bank of America Corporation provides banking and financial products and services for individuals, businesses, and institutional investors.'
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
