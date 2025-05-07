import React, { useState } from 'react';
import { useMediaQuery } from '@/hooks/use-mobile';
import MobileLayout from '@/components/layouts/MobileLayout';
import DesktopLayout from '@/components/layouts/DesktopLayout';
import { useWallet } from '@/hooks/useWallet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EyeOff, Eye, Plus, Send } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import WalletHeader from '@/components/wallet/WalletHeader';
import WalletActions from '@/components/wallet/WalletActions';
import TransactionHistoryList from '@/components/wallet/TransactionHistoryList';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

// Transaction Schema
const transactionSchema = z.object({
  amount: z.coerce.number().positive({ message: "Amount must be greater than 0" }),
  description: z.string().optional(),
});

const WalletPage: React.FC = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { wallet, transactions, deposit, withdraw, transfer, isLoading } = useWallet();
  const { toast } = useToast();
  const [showBalance, setShowBalance] = useState(true);
  
  // Dialog states
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  
  // Forms
  const depositForm = useForm<z.infer<typeof transactionSchema>>({
    resolver: zodResolver(transactionSchema),
    defaultValues: { amount: 0, description: "" },
  });
  
  const withdrawForm = useForm<z.infer<typeof transactionSchema>>({
    resolver: zodResolver(transactionSchema),
    defaultValues: { amount: 0, description: "" },
  });
  
  const transferForm = useForm<z.infer<typeof transactionSchema> & { receiverId: number }>({
    resolver: zodResolver(transactionSchema.extend({
      receiverId: z.coerce.number().positive({ message: "Recipient ID is required" })
    })),
    defaultValues: { amount: 0, description: "", receiverId: 0 },
  });
  
  const toggleBalanceVisibility = () => {
    setShowBalance(prev => !prev);
  };
  
  // Handle deposit submit
  const onDepositSubmit = async (values: z.infer<typeof transactionSchema>) => {
    try {
      await deposit(values.amount, values.description);
      toast({
        title: "Deposit successful",
        description: `KES ${values.amount} has been added to your wallet.`,
      });
      setIsDepositOpen(false);
      depositForm.reset();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Deposit failed",
        description: error.message || "An error occurred during the deposit.",
      });
    }
  };
  
  // Handle withdraw submit
  const onWithdrawSubmit = async (values: z.infer<typeof transactionSchema>) => {
    try {
      await withdraw(values.amount, values.description);
      toast({
        title: "Withdrawal successful",
        description: `KES ${values.amount} has been withdrawn from your wallet.`,
      });
      setIsWithdrawOpen(false);
      withdrawForm.reset();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Withdrawal failed",
        description: error.message || "An error occurred during the withdrawal.",
      });
    }
  };
  
  // Handle transfer submit
  const onTransferSubmit = async (values: z.infer<typeof transactionSchema> & { receiverId: number }) => {
    try {
      await transfer(values.amount, values.receiverId, values.description);
      toast({
        title: "Transfer successful",
        description: `KES ${values.amount} has been transferred.`,
      });
      setIsTransferOpen(false);
      transferForm.reset();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Transfer failed",
        description: error.message || "An error occurred during the transfer.",
      });
    }
  };
  
  const formattedBalance = wallet ? formatCurrency(wallet.balance, wallet.currency) : 'KES 0.00';
  
  const content = (
    <div className={isMobile ? "p-4" : ""}>
      {/* Wallet Header */}
      <WalletHeader 
        balance={wallet?.balance || 0} 
        currency={wallet?.currency || 'KES'} 
        showBalance={showBalance}
        onToggleVisibility={toggleBalanceVisibility}
      />
      
      {/* Quick Actions */}
      <WalletActions 
        onDeposit={() => setIsDepositOpen(true)}
        onWithdraw={() => setIsWithdrawOpen(true)}
        onTransfer={() => setIsTransferOpen(true)}
      />
      
      {/* Transactions */}
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="incoming">Incoming</TabsTrigger>
              <TabsTrigger value="outgoing">Outgoing</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all">
              <TransactionHistoryList transactions={transactions} />
            </TabsContent>
            
            <TabsContent value="incoming">
              <TransactionHistoryList 
                transactions={transactions.filter(t => 
                  t.type === 'deposit' || (t.type === 'transfer' && t.amount > 0)
                )} 
              />
            </TabsContent>
            
            <TabsContent value="outgoing">
              <TransactionHistoryList 
                transactions={transactions.filter(t => 
                  t.type === 'withdrawal' || t.type === 'contribution' || 
                  (t.type === 'transfer' && t.amount < 0)
                )} 
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Deposit Dialog */}
      <Dialog open={isDepositOpen} onOpenChange={setIsDepositOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deposit Funds</DialogTitle>
            <DialogDescription>
              Add funds to your wallet. This simulates an M-Pesa deposit.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...depositForm}>
            <form onSubmit={depositForm.handleSubmit(onDepositSubmit)} className="space-y-4">
              <FormField
                control={depositForm.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount (KES)</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" step="any" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={depositForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Savings deposit" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="submit" disabled={depositForm.formState.isSubmitting}>
                  {depositForm.formState.isSubmitting ? "Processing..." : "Deposit"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Withdraw Dialog */}
      <Dialog open={isWithdrawOpen} onOpenChange={setIsWithdrawOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Withdraw Funds</DialogTitle>
            <DialogDescription>
              Withdraw funds from your wallet. This simulates an M-Pesa withdrawal.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...withdrawForm}>
            <form onSubmit={withdrawForm.handleSubmit(onWithdrawSubmit)} className="space-y-4">
              <FormField
                control={withdrawForm.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount (KES)</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" step="any" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={withdrawForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Personal expenses" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="submit" disabled={withdrawForm.formState.isSubmitting}>
                  {withdrawForm.formState.isSubmitting ? "Processing..." : "Withdraw"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Transfer Dialog */}
      <Dialog open={isTransferOpen} onOpenChange={setIsTransferOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transfer Funds</DialogTitle>
            <DialogDescription>
              Send money to another user.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...transferForm}>
            <form onSubmit={transferForm.handleSubmit(onTransferSubmit)} className="space-y-4">
              <FormField
                control={transferForm.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount (KES)</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" step="any" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={transferForm.control}
                name="receiverId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recipient ID</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" {...field} />
                    </FormControl>
                    <FormDescription>
                      Enter the user ID of the recipient.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={transferForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Payment for services" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="submit" disabled={transferForm.formState.isSubmitting}>
                  {transferForm.formState.isSubmitting ? "Processing..." : "Transfer"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );

  return (
    <>
      {isMobile ? (
        <MobileLayout title="My Wallet">
          {content}
        </MobileLayout>
      ) : (
        <DesktopLayout title="My Wallet" subtitle="Manage your personal finances and transactions">
          {content}
        </DesktopLayout>
      )}
    </>
  );
};

export default WalletPage;
