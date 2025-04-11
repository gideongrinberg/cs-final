
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  getPopularStocks, 
  getInitialPortfolio,
  getUserPortfolio,
  savePortfolio, 
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

// Default ticker interval in milliseconds (5 seconds)
const DEFAULT_TICKER_INTERVAL = 5000;

// Cache daily price changes for consistent daily stats
interface StockDailyCache {
  [ticker: string]: { 
    previousClose: number; 
    dayOpen: number; 
    lastUpdated: string;
  };
}

export const StockProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [portfolio, setPortfolio] = useState<Portfolio>(getInitialPortfolio());
  const [orders, setOrders] = useState<Order[]>([]);
  const [watchlist, setWatchlist] = useState<string[]>(['GOOGL', 'NFLX', 'DIS']);
  const [loadingStocks, setLoadingStocks] = useState(true);
  const [dailyStockCache, setDailyStockCache] = useState<StockDailyCache>({});
  const { user } = useAuth();
  
  // Load user data from Supabase
  const loadUserData = async () => {
    if (!user) return;
    
    try {
      // Load portfolio
      const userPortfolio = await getUserPortfolio(user.id);
      if (userPortfolio) {
        setPortfolio(userPortfolio);
      }
      
      // Load orders
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('timestamp', { ascending: false });
      
      if (orderError) {
        console.error('Error loading orders:', orderError);
      } else if (orderData) {
        const formattedOrders: Order[] = orderData.map(order => ({
          ticker: order.ticker,
          shares: Number(order.shares),
          price: Number(order.price),
          type: order.type as 'buy' | 'sell',
          status: order.status as 'pending' | 'completed' | 'failed',
          timestamp: new Date(order.timestamp)
        }));
        setOrders(formattedOrders);
      }
      
      // Load watchlist
      const { data: watchlistData, error: watchlistError } = await supabase
        .from('watchlist_items')
        .select('*')
        .eq('user_id', user.id);
      
      if (watchlistError) {
        console.error('Error loading watchlist:', watchlistError);
      } else if (watchlistData) {
        setWatchlist(watchlistData.map(item => item.ticker));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  // Save portfolio to Supabase
  const saveUserPortfolio = async () => {
    if (!user) return;
    
    try {
      await savePortfolio(user.id, portfolio);
    } catch (error) {
      console.error('Error saving portfolio:', error);
    }
  };

  // Initialize daily stock cache
  const initializeDailyCache = () => {
    const today = new Date().toDateString();
    const stocksData = getPopularStocks();
    
    const newCache: StockDailyCache = {};
    stocksData.forEach(stock => {
      newCache[stock.ticker] = {
        previousClose: stock.price - stock.change, // Use the current daily change
        dayOpen: stock.price - (stock.change * 0.6), // Simulate an open price
        lastUpdated: today
      };
    });
    
    setDailyStockCache(newCache);
    return newCache;
  };

  // Load initial data
  useEffect(() => {
    refreshData();
    
    if (user) {
      loadUserData();
    }
  }, [user]);

  // Save portfolio when it changes
  useEffect(() => {
    if (user) {
      saveUserPortfolio();
    }
  }, [portfolio, user]);

  // Set up ticker for real-time price updates
  useEffect(() => {
    // Initial load
    refreshData();

    // Set up daily cache if needed
    const cache = Object.keys(dailyStockCache).length === 0 ? 
      initializeDailyCache() : dailyStockCache;

    // Reset cache at the start of a new day
    const checkNewDay = () => {
      const today = new Date().toDateString();
      if (Object.values(cache)[0]?.lastUpdated !== today) {
        console.log("New day detected, resetting daily cache");
        initializeDailyCache();
      }
    };

    // Set up ticker interval
    const tickerInterval = setInterval(() => {
      checkNewDay();
      console.log("Ticker updating prices...");
      
      // Get updated stock data
      const updatedStocks = getPopularStocks().map(stock => {
        // Ensure we maintain daily change values, not just tick changes
        const cachedStock = dailyStockCache[stock.ticker];
        if (cachedStock) {
          const dailyChange = stock.price - cachedStock.previousClose;
          const dailyPercentChange = (dailyChange / cachedStock.previousClose) * 100;
          
          return {
            ...stock,
            change: +dailyChange.toFixed(2),
            percentChange: +dailyPercentChange.toFixed(2)
          };
        }
        return stock;
      });
      
      setStocks(updatedStocks);
      
      // Update portfolio values based on new stock prices
      updatePortfolioValues(updatedStocks);
    }, DEFAULT_TICKER_INTERVAL);

    // Clean up interval on unmount
    return () => clearInterval(tickerInterval);
  }, [dailyStockCache]);

  // Update portfolio values based on current stock prices
  const updatePortfolioValues = (currentStocks: Stock[]) => {
    setPortfolio(prev => {
      const updatedHoldings = [...prev.holdings];
      let totalValue = prev.balance;
      let totalCost = 0;
      
      // Recalculate holdings value based on current stock prices
      updatedHoldings.forEach(holding => {
        const stockForHolding = currentStocks.find(s => s.ticker === holding.ticker);
        if (stockForHolding) {
          totalValue += stockForHolding.price * holding.shares;
          totalCost += holding.averageCost * holding.shares;
        }
      });
      
      const totalProfit = totalValue - prev.balance - totalCost;
      const totalProfitPercent = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0;

      return {
        ...prev,
        holdings: updatedHoldings,
        totalValue: +totalValue.toFixed(2),
        totalProfit: +totalProfit.toFixed(2),
        totalProfitPercent: +totalProfitPercent.toFixed(2)
      };
    });
  };

  // Refresh stock data
  const refreshData = () => {
    setLoadingStocks(true);
    setTimeout(() => {
      const freshStocks = getPopularStocks();
      
      // Initialize daily cache if needed
      if (Object.keys(dailyStockCache).length === 0) {
        initializeDailyCache();
      }
      
      setStocks(freshStocks);
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
    if (!user) {
      toast.error("You must be logged in to place orders");
      return false;
    }
    
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

    try {
      // Save order to database
      const { error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          ticker,
          shares,
          price: stock.price,
          type,
          status: 'pending',
          timestamp: newOrder.timestamp.toISOString()
        });
      
      if (orderError) {
        console.error('Error saving order:', orderError);
        throw new Error('Failed to save order');
      }
      
      // Simulate processing
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update the order status
      newOrder.status = 'completed';
      setOrders(prev => prev.map(o => 
        o.timestamp === newOrder.timestamp ? newOrder : o
      ));
      
      // Update order status in database
      const { error: updateError } = await supabase
        .from('orders')
        .update({ status: 'completed' })
        .eq('user_id', user.id)
        .eq('ticker', ticker)
        .eq('timestamp', newOrder.timestamp.toISOString());
      
      if (updateError) {
        console.error('Error updating order status:', updateError);
      }
      
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
    } catch (error) {
      console.error('Order execution error:', error);
      
      // Update order status to failed
      newOrder.status = 'failed';
      setOrders(prev => prev.map(o => 
        o.timestamp === newOrder.timestamp ? newOrder : o
      ));
      
      // Update order status in database
      if (user) {
        await supabase
          .from('orders')
          .update({ status: 'failed' })
          .eq('user_id', user.id)
          .eq('ticker', ticker)
          .eq('timestamp', newOrder.timestamp.toISOString());
      }
      
      toast.error('Order failed to execute');
      return false;
    }
  };

  // Add a stock to watchlist
  const addToWatchlist = async (ticker: string) => {
    if (!user) {
      toast.error("You must be logged in to manage your watchlist");
      return;
    }
    
    if (!watchlist.includes(ticker)) {
      setWatchlist(prev => [...prev, ticker]);
      
      try {
        const { error } = await supabase
          .from('watchlist_items')
          .insert({ user_id: user.id, ticker });
        
        if (error) {
          console.error('Error adding to watchlist:', error);
          // Revert UI change if database operation fails
          setWatchlist(prev => prev.filter(t => t !== ticker));
          toast.error("Failed to add to watchlist");
        } else {
          toast.success(`Added ${ticker} to watchlist`);
        }
      } catch (error) {
        console.error('Error adding to watchlist:', error);
        // Revert UI change if operation fails
        setWatchlist(prev => prev.filter(t => t !== ticker));
        toast.error("Failed to add to watchlist");
      }
    }
  };

  // Remove a stock from watchlist
  const removeFromWatchlist = async (ticker: string) => {
    if (!user) {
      toast.error("You must be logged in to manage your watchlist");
      return;
    }
    
    setWatchlist(prev => prev.filter(t => t !== ticker));
    
    try {
      const { error } = await supabase
        .from('watchlist_items')
        .delete()
        .eq('user_id', user.id)
        .eq('ticker', ticker);
      
      if (error) {
        console.error('Error removing from watchlist:', error);
        // Revert UI change if database operation fails
        setWatchlist(prev => [...prev, ticker]);
        toast.error("Failed to remove from watchlist");
      } else {
        toast.success(`Removed ${ticker} from watchlist`);
      }
    } catch (error) {
      console.error('Error removing from watchlist:', error);
      // Revert UI change if operation fails
      setWatchlist(prev => [...prev, ticker]);
      toast.error("Failed to remove from watchlist");
    }
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
