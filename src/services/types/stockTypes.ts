
// Common types used across stock services

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

// Portfolio types
export interface Holding {
  ticker: string;
  shares: number;
  averageCost: number;
}

export interface Portfolio {
  balance: number;
  holdings: Holding[];
  totalValue: number;
  totalProfit: number;
  totalProfitPercent: number;
}

// Price history resolution and timeframe types
export type TimeFrame = '1m' | '5m' | '15m' | '30m' | '1h' | '1D' | '5D' | '1W' | '1M' | '3M' | '6M' | '1Y' | '5Y';
export type Resolution = '1sec' | '5sec' | '30sec' | '1min' | '5min' | '15min' | '30min' | '1hour' | '1day' | '1week';
