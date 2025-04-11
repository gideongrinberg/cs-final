
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/utils/stockUtils';
import { useStockContext } from '@/contexts/StockContext';
import { Stock } from '@/services/stockService';

interface StockListProps {
  title: string;
  showWatchlistActions?: boolean;
}

const StockList: React.FC<StockListProps> = ({ title, showWatchlistActions = false }) => {
  const { stocks, watchlist, addToWatchlist, removeFromWatchlist, loadingStocks } = useStockContext();

  // Filter stocks based on watchlist if needed
  const displayedStocks = showWatchlistActions 
    ? stocks.filter(stock => watchlist.includes(stock.ticker))
    : stocks;

  return (
    <div className="rounded-lg border">
      <div className="py-4 px-6 border-b">
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      <div className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Symbol</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Change</TableHead>
              {showWatchlistActions && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loadingStocks ? (
              Array(5).fill(0).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                  {showWatchlistActions && (
                    <TableCell className="text-right"><Skeleton className="h-8 w-8 rounded-md ml-auto" /></TableCell>
                  )}
                </TableRow>
              ))
            ) : displayedStocks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={showWatchlistActions ? 5 : 4} className="text-center py-6 text-muted-foreground">
                  No stocks to display
                </TableCell>
              </TableRow>
            ) : (
              displayedStocks.map((stock) => (
                <StockRow 
                  key={stock.ticker} 
                  stock={stock} 
                  inWatchlist={watchlist.includes(stock.ticker)} 
                  onAddToWatchlist={() => addToWatchlist(stock.ticker)}
                  onRemoveFromWatchlist={() => removeFromWatchlist(stock.ticker)}
                  showWatchlistActions={showWatchlistActions}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

interface StockRowProps {
  stock: Stock;
  inWatchlist: boolean;
  onAddToWatchlist: () => void;
  onRemoveFromWatchlist: () => void;
  showWatchlistActions: boolean;
}

const StockRow: React.FC<StockRowProps> = ({ 
  stock, 
  inWatchlist, 
  onAddToWatchlist, 
  onRemoveFromWatchlist,
  showWatchlistActions
}) => {
  const isPositive = stock.percentChange >= 0;
  
  return (
    <TableRow className="hover:bg-muted/50">
      <TableCell className="font-medium">
        <Link to={`/stocks/${stock.ticker}`} className="hover:text-primary">{stock.ticker}</Link>
      </TableCell>
      <TableCell>
        <Link to={`/stocks/${stock.ticker}`} className="hover:text-primary">{stock.name}</Link>
      </TableCell>
      <TableCell className="text-right">{formatCurrency(stock.price)}</TableCell>
      <TableCell className={`text-right ${isPositive ? 'text-success' : 'text-danger'}`}>
        <div className="flex items-center justify-end">
          {isPositive ? <ArrowUp className="h-4 w-4 mr-1" /> : <ArrowDown className="h-4 w-4 mr-1" />}
          <span>{isPositive ? '+' : ''}{stock.percentChange}%</span>
        </div>
      </TableCell>
      {showWatchlistActions && (
        <TableCell className="text-right">
          {inWatchlist ? (
            <button 
              onClick={onRemoveFromWatchlist}
              className="text-sm px-2 py-1 rounded bg-secondary hover:bg-secondary/80"
            >
              Remove
            </button>
          ) : (
            <button 
              onClick={onAddToWatchlist}
              className="text-sm px-2 py-1 rounded bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Add
            </button>
          )}
        </TableCell>
      )}
    </TableRow>
  );
};

export default StockList;
