
import { Portfolio, Holding } from './types/stockTypes';
import { getPopularStocks } from './stockData';
import { supabase } from '@/integrations/supabase/client';

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
    const stock = getPopularStocks().find(s => s.ticker === holding.ticker);
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

// Get user's portfolio from database
export const getUserPortfolio = async (userId: string): Promise<Portfolio | null> => {
  try {
    // Get the portfolio
    const { data: portfolioData, error: portfolioError } = await supabase
      .from('portfolios')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (portfolioError) {
      console.error('Error fetching portfolio:', portfolioError);
      return null;
    }
    
    // Get the holdings
    const { data: holdingsData, error: holdingsError } = await supabase
      .from('holdings')
      .select('*')
      .eq('portfolio_id', portfolioData.id);
    
    if (holdingsError) {
      console.error('Error fetching holdings:', holdingsError);
      return null;
    }
    
    // Map database holdings to application holdings
    const holdings: Holding[] = holdingsData.map(h => ({
      ticker: h.ticker,
      shares: Number(h.shares),
      averageCost: Number(h.average_cost)
    }));
    
    return {
      balance: Number(portfolioData.balance),
      holdings,
      totalValue: Number(portfolioData.total_value),
      totalProfit: Number(portfolioData.total_profit),
      totalProfitPercent: Number(portfolioData.total_profit_percent)
    };
  } catch (error) {
    console.error('Error in getUserPortfolio:', error);
    return null;
  }
};

// Save portfolio to database
export const savePortfolio = async (userId: string, portfolio: Portfolio): Promise<boolean> => {
  try {
    // Get the portfolio ID
    const { data: portfolioData, error: portfolioError } = await supabase
      .from('portfolios')
      .select('id')
      .eq('user_id', userId)
      .single();
    
    if (portfolioError) {
      console.error('Error fetching portfolio ID:', portfolioError);
      return false;
    }
    
    const portfolioId = portfolioData.id;
    
    // Update the portfolio
    const { error: updateError } = await supabase
      .from('portfolios')
      .update({
        balance: portfolio.balance,
        total_value: portfolio.totalValue,
        total_profit: portfolio.totalProfit,
        total_profit_percent: portfolio.totalProfitPercent,
        updated_at: new Date().toISOString()
      })
      .eq('id', portfolioId);
    
    if (updateError) {
      console.error('Error updating portfolio:', updateError);
      return false;
    }
    
    // Delete all existing holdings for this portfolio
    const { error: deleteError } = await supabase
      .from('holdings')
      .delete()
      .eq('portfolio_id', portfolioId);
    
    if (deleteError) {
      console.error('Error deleting holdings:', deleteError);
      return false;
    }
    
    // Insert new holdings
    if (portfolio.holdings.length > 0) {
      const holdingsToInsert = portfolio.holdings.map(h => ({
        portfolio_id: portfolioId,
        ticker: h.ticker,
        shares: h.shares,
        average_cost: h.averageCost
      }));
      
      const { error: insertError } = await supabase
        .from('holdings')
        .insert(holdingsToInsert);
      
      if (insertError) {
        console.error('Error inserting holdings:', insertError);
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error in savePortfolio:', error);
    return false;
  }
};
