
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useStockContext } from '@/contexts/StockContext';
import { formatCurrency } from '@/utils/stockUtils';

const Account = () => {
  const { portfolio, orders } = useStockContext();
  
  const totalBought = orders
    .filter(o => o.type === 'buy' && o.status === 'completed')
    .reduce((sum, o) => sum + (o.shares * o.price), 0);
    
  const totalSold = orders
    .filter(o => o.type === 'sell' && o.status === 'completed')
    .reduce((sum, o) => sum + (o.shares * o.price), 0);
  
  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-3xl font-bold">Account</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Account Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 rounded-lg border">
              <p className="text-muted-foreground mb-1">Available Cash</p>
              <p className="text-3xl font-bold">{formatCurrency(portfolio.balance)}</p>
            </div>
            
            <div className="mt-4 grid grid-cols-2 gap-4">
              <Button className="w-full" size="lg">Deposit Funds</Button>
              <Button variant="outline" className="w-full" size="lg">Withdraw</Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Account Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between p-3 border rounded-md">
                <span className="text-muted-foreground">Total Purchased</span>
                <span className="font-semibold">{formatCurrency(totalBought)}</span>
              </div>
              <div className="flex justify-between p-3 border rounded-md">
                <span className="text-muted-foreground">Total Sold</span>
                <span className="font-semibold">{formatCurrency(totalSold)}</span>
              </div>
              <div className="flex justify-between p-3 border rounded-md">
                <span className="text-muted-foreground">Total Trades</span>
                <span className="font-semibold">{orders.filter(o => o.status === 'completed').length}</span>
              </div>
              <div className="flex justify-between p-3 border rounded-md">
                <span className="text-muted-foreground">Account Type</span>
                <span className="font-semibold">Simulated Trading</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline">Profile Settings</Button>
            <Button variant="outline">Notifications</Button>
            <Button variant="outline">Security Settings</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Account;
