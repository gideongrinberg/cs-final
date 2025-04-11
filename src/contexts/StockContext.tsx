
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  getPopularStocks, 
  getInitialPortfolio, 
  Stock, 
  Portfolio, 
  Holding,
  StockDetail,
  getStockByTicker
} from '@/services/stockService';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface Order {
  ticker: string;
  shares: number;
  price: number;
  type: 'buy' | 'sell';
  status: 'pending' | 'completed' | 'failed';
  timestamp: Date;
}

interface StockContextType {
  stocks: Stock[];
  portfolio: Portfolio;
  orders: Order[];
  watchlist: string[];
  executeOrder: (ticker: string, shares: number, type: 'buy' | 'sell') => Promise<boolean>;
  addToWatchlist: (ticker: string) => void;
  removeFromWatchlist: (ticker: string) => void;
  refreshData: () => void;
  loadingStocks: boolean;
  modifyFunds: (amount: number) => void;
}

const StockContext = createContext<StockContextType | undefined>(undefined);

export const StockProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [portfolio, setPortfolio] = useState<Portfolio>(getInitialPortfolio());
  const [orders, setOrders] = useState<Order[]>([]);
  const [watchlist, setWatchlist] = useState<string[]>(['GOOGL', 'NFLX', 'DIS']);
  const [loadingStocks, setLoadingStocks] = useState(true);
  const { user } = useAuth();

  // Load initial data
  useEffect(() => {
    refreshData();
    
    // If we have a user, we would normally load their portfolio from the database
    // For this simulation, we'll just use the mock data
  }, [user]);

  // Refresh stock data
  const refreshData = () => {
    setLoadingStocks(true);
    setTimeout(() => {
      setStocks(getPopularStocks());
      setLoadingStocks(false);
    }, 500); // Small timeout to simulate network request
  };

  // Modify funds (deposit or withdraw)
  const modifyFunds = (amount: number) => {
    setPortfolio(prev => {
      const newBalance = prev.balance + amount;
      return {
        ...prev,
        balance: +newBalance.toFixed(2),
        totalValue: +(prev.totalValue + amount).toFixed(2)
      };
    });
  };

  // Execute a buy or sell order
  const executeOrder = async (ticker: string, shares: number, type: 'buy' | 'sell'): Promise<boolean> => {
    // Find the stock
    const stock = stocks.find(s => s.ticker === ticker);
    if (!stock) {
      toast.error(`Stock ${ticker} not found`);
      return false;
    }

    const totalAmount = stock.price * shares;

    // Check if selling more than owned
    if (type === 'sell') {
      const holding = portfolio.holdings.find(h => h.ticker === ticker);
      if (!holding || holding.shares < shares) {
        toast.error("You don't own enough shares to sell");
        return false;
      }
    }

    // Check if enough cash for buying
    if (type === 'buy' && portfolio.balance < totalAmount) {
      toast.error("Insufficient funds to complete this purchase");
      return false;
    }

    // Create the order
    const newOrder: Order = {
      ticker,
      shares,
      price: stock.price,
      type,
      status: 'pending',
      timestamp: new Date(),
    };

    // Add to orders list
    setOrders(prev => [newOrder, ...prev]);

    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Update the order status
    newOrder.status = 'completed';
    setOrders(prev => prev.map(o => 
      o.timestamp === newOrder.timestamp ? newOrder : o
    ));

    // Update portfolio
    setPortfolio(prev => {
      let updatedHoldings = [...prev.holdings];
      let updatedBalance = prev.balance;

      if (type === 'buy') {
        updatedBalance -= totalAmount;
        
        // Update existing holding or add new one
        const existingHoldingIndex = updatedHoldings.findIndex(h => h.ticker === ticker);
        if (existingHoldingIndex >= 0) {
          const existingHolding = updatedHoldings[existingHoldingIndex];
          const totalShares = existingHolding.shares + shares;
          const totalCost = existingHolding.averageCost * existingHolding.shares + stock.price * shares;
          const newAverageCost = totalCost / totalShares;
          
          updatedHoldings[existingHoldingIndex] = {
            ...existingHolding,
            shares: totalShares,
            averageCost: +newAverageCost.toFixed(2)
          };
        } else {
          updatedHoldings.push({
            ticker,
            shares,
            averageCost: stock.price
          });
        }
      } else if (type === 'sell') {
        updatedBalance += totalAmount;
        
        // Update existing holding
        updatedHoldings = updatedHoldings.map(holding => {
          if (holding.ticker === ticker) {
            const newShares = holding.shares - shares;
            return {
              ...holding,
              shares: newShares
            };
          }
          return holding;
        }).filter(holding => holding.shares > 0);
      }

      // Recalculate total value and profit
      let totalValue = updatedBalance;
      let totalCost = 0;
      
      updatedHoldings.forEach(holding => {
        const stockForHolding = stocks.find(s => s.ticker === holding.ticker);
        if (stockForHolding) {
          totalValue += stockForHolding.price * holding.shares;
          totalCost += holding.averageCost * holding.shares;
        }
      });
      
      const totalProfit = totalValue - updatedBalance - totalCost;
      const totalProfitPercent = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0;

      return {
        balance: +updatedBalance.toFixed(2),
        holdings: updatedHoldings,
        totalValue: +totalValue.toFixed(2),
        totalProfit: +totalProfit.toFixed(2),
        totalProfitPercent: +totalProfitPercent.toFixed(2)
      };
    });

    toast.success(`${type === 'buy' ? 'Bought' : 'Sold'} ${shares} shares of ${ticker} at $${stock.price}`);
    return true;
  };

  // Add a stock to watchlist
  const addToWatchlist = (ticker: string) => {
    if (!watchlist.includes(ticker)) {
      setWatchlist(prev => [...prev, ticker]);
      toast.success(`Added ${ticker} to watchlist`);
    }
  };

  // Remove a stock from watchlist
  const removeFromWatchlist = (ticker: string) => {
    setWatchlist(prev => prev.filter(t => t !== ticker));
    toast.success(`Removed ${ticker} from watchlist`);
  };

  return (
    <StockContext.Provider
      value={{
        stocks,
        portfolio,
        orders,
        watchlist,
        executeOrder,
        addToWatchlist,
        removeFromWatchlist,
        refreshData,
        loadingStocks,
        modifyFunds
      }}
    >
      {children}
    </StockContext.Provider>
  );
};

export const useStockContext = () => {
  const context = useContext(StockContext);
  if (context === undefined) {
    throw new Error('useStockContext must be used within a StockProvider');
  }
  return context;
};
