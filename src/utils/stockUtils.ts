
// Function to generate a random price movement with some bias
export const generatePriceMovement = (
  currentPrice: number,
  volatility: number = 0.02,
  bias: number = 0
): number => {
  const movement = (Math.random() - 0.5 + bias) * volatility * currentPrice;
  return Math.max(0.01, +(currentPrice + movement).toFixed(2));
};

// Generate a random stock price history for a given time frame
export const generatePriceHistory = (
  ticker: string,
  days: number,
  dataPoints: number,
  initialPrice?: number,
  volatility?: number
): { date: Date; price: number }[] => {
  const now = new Date();
  const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  const priceHistory: { date: Date; price: number }[] = [];
  
  const stockVolatility = volatility || Math.random() * 0.05 + 0.01;
  let lastPrice = initialPrice || Math.random() * 1000 + 10;
  
  for (let i = 0; i < dataPoints; i++) {
    const timeStep = (days * 24 * 60 * 60 * 1000) / (dataPoints - 1);
    const date = new Date(startDate.getTime() + i * timeStep);
    
    // Add some bias based on the ticker to simulate different stock behaviors
    const tickerSeed = ticker.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    const bias = (tickerSeed % 10 - 5) / 100;
    
    lastPrice = generatePriceMovement(lastPrice, stockVolatility, bias);
    priceHistory.push({ date, price: lastPrice });
  }
  
  return priceHistory;
};

// Format currency for display
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

// Format percentage for display
export const formatPercentage = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value / 100);
};

// Calculate price change and percentage
export const calculateChange = (
  currentPrice: number,
  previousPrice: number
): { change: number; percentChange: number } => {
  const change = currentPrice - previousPrice;
  const percentChange = (change / previousPrice) * 100;
  return {
    change: +change.toFixed(2),
    percentChange: +percentChange.toFixed(2)
  };
};
