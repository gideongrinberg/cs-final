
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useStockContext } from '@/contexts/StockContext';
import { formatCurrency } from '@/utils/stockUtils';
import { Input } from '@/components/ui/input';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const fundsSchema = z.object({
  amount: z.coerce.number()
    .min(1, { message: 'Amount must be at least $1' })
    .max(1000000, { message: 'Amount cannot exceed $1,000,000' })
});

const Account = () => {
  const { portfolio, orders, modifyFunds } = useStockContext();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isDepositing, setIsDepositing] = useState(false);
  
  const totalBought = orders
    .filter(o => o.type === 'buy' && o.status === 'completed')
    .reduce((sum, o) => sum + (o.shares * o.price), 0);
    
  const totalSold = orders
    .filter(o => o.type === 'sell' && o.status === 'completed')
    .reduce((sum, o) => sum + (o.shares * o.price), 0);
  
  const form = useForm<z.infer<typeof fundsSchema>>({
    resolver: zodResolver(fundsSchema),
    defaultValues: {
      amount: 1000
    }
  });

  const handleModifyFunds = (action: 'deposit' | 'withdraw') => {
    form.handleSubmit((data) => {
      const amount = action === 'withdraw' ? -data.amount : data.amount;
      
      // Check if withdrawal would result in negative balance
      if (action === 'withdraw' && portfolio.balance < data.amount) {
        toast({
          title: "Insufficient funds",
          description: "You don't have enough funds to withdraw this amount",
          variant: "destructive"
        });
        return;
      }
      
      modifyFunds(amount);
      toast({
        title: action === 'deposit' ? "Funds Deposited" : "Funds Withdrawn",
        description: `${formatCurrency(data.amount)} has been ${action === 'deposit' ? 'added to' : 'removed from'} your account.`
      });
    })();
  };

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
            
            {isDepositing ? (
              <div className="mt-4">
                <Form {...form}>
                  <form className="space-y-4">
                    <FormField
                      control={form.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Amount</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" min="1" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex space-x-2">
                      <Button 
                        type="button" 
                        onClick={() => handleModifyFunds('deposit')}
                        className="flex-1"
                      >
                        Deposit
                      </Button>
                      <Button 
                        type="button" 
                        onClick={() => handleModifyFunds('withdraw')}
                        variant="outline"
                        className="flex-1"
                      >
                        Withdraw
                      </Button>
                      <Button 
                        type="button" 
                        variant="ghost"
                        onClick={() => setIsDepositing(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </Form>
              </div>
            ) : (
              <div className="mt-4 grid grid-cols-2 gap-4">
                <Button className="w-full" size="lg" onClick={() => setIsDepositing(true)}>
                  Deposit Funds
                </Button>
                <Button variant="outline" className="w-full" size="lg" onClick={() => setIsDepositing(true)}>
                  Withdraw
                </Button>
              </div>
            )}
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
                <span className="font-semibold">Paper Trading</span>
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
          <div className="space-y-4">
            <div className="flex justify-between p-3 border rounded-md">
              <span className="text-muted-foreground">Email</span>
              <span className="font-semibold">{user?.email}</span>
            </div>
            <div className="flex justify-between p-3 border rounded-md">
              <span className="text-muted-foreground">Account ID</span>
              <span className="font-semibold">{user?.id?.substring(0, 8)}...</span>
            </div>
            <div className="flex justify-between p-3 border rounded-md">
              <span className="text-muted-foreground">Account Created</span>
              <span className="font-semibold">{new Date(user?.created_at || '').toLocaleDateString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Account;
