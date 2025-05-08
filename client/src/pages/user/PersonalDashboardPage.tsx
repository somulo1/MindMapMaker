import React, { useState } from 'react';
import { useMediaQuery } from '@/hooks/use-mobile';
import MobileLayout from '@/components/layouts/MobileLayout';
import DesktopLayout from '@/components/layouts/DesktopLayout';
import QuickActions from '@/components/dashboard/QuickActions';
import WalletCard from '@/components/dashboard/WalletCard';
import TransactionList from '@/components/dashboard/TransactionList';
import ChamaList from '@/components/dashboard/ChamaList';
import LearningHub from '@/components/dashboard/LearningHub';
import AIAssistant from '@/components/dashboard/AIAssistant';
import MarketplacePreview from '@/components/dashboard/MarketplacePreview';
import { useAuth } from '@/context/AuthContext';
import { MdGroups, MdReceiptLong, MdStore, MdSmartToy } from 'react-icons/md';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useWallet } from '@/hooks/useWallet';
import { useChama } from '@/hooks/useChama';
import { useToast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

// Transaction Dialog Schema
const transactionSchema = z.object({
  amount: z.coerce.number().positive({ message: "Amount must be greater than 0" }),
  description: z.string().optional(),
});

// Create Chama Schema
const createChamaSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters" }),
  description: z.string().optional(),
  icon: z.string().default("groups"),
  iconBg: z.string().default("primary"),
});

const PersonalDashboardPage: React.FC = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { user } = useAuth();
  const { toast } = useToast();
  const { deposit, withdraw } = useWallet();
  const { createChama } = useChama();
  
  // Dialog states
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isChamaOpen, setIsChamaOpen] = useState(false);
  
  // Forms
  const depositForm = useForm<z.infer<typeof transactionSchema>>({
    resolver: zodResolver(transactionSchema),
    defaultValues: { amount: 0, description: "" },
  });
  
  const withdrawForm = useForm<z.infer<typeof transactionSchema>>({
    resolver: zodResolver(transactionSchema),
    defaultValues: { amount: 0, description: "" },
  });
  
  const transferForm = useForm<z.infer<typeof transactionSchema>>({
    resolver: zodResolver(transactionSchema),
    defaultValues: { amount: 0, description: "" },
  });
  
  const chamaForm = useForm<z.infer<typeof createChamaSchema>>({
    resolver: zodResolver(createChamaSchema),
    defaultValues: { 
      name: "", 
      description: "", 
      icon: "groups", 
      iconBg: "primary" 
    },
  });
  
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
  const onTransferSubmit = async (values: z.infer<typeof transactionSchema>) => {
    // In a real implementation, this would handle transfers to other users
    toast({
      title: "Transfer initiated",
      description: "This feature is coming soon.",
    });
    setIsTransferOpen(false);
    transferForm.reset();
  };
  
  // Handle create chama submit
  const onCreateChamaSubmit = async (values: z.infer<typeof createChamaSchema>) => {
    try {
      await createChama(values);
      toast({
        title: "Chama created",
        description: `Your new chama "${values.name}" has been created.`,
      });
      setIsChamaOpen(false);
      chamaForm.reset();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to create chama",
        description: error.message || "An error occurred while creating the chama.",
      });
    }
  };

  const firstName = user?.fullName ? user.fullName.split(' ')[0] : user?.username;
  
  const mobileContent = (
    <div className="p-4">
      {/* Welcome Section */}
      <section className="mb-5">
        <h1 className="text-xl font-bold mb-1">Hello, {firstName}</h1>
        <p className="text-neutral-500 dark:text-neutral-400 text-sm">Welcome to your financial hub</p>
      </section>
      
      {/* Wallet Card */}
      <WalletCard 
        onDeposit={() => setIsDepositOpen(true)}
        onTransfer={() => setIsTransferOpen(true)}
      />
      
      {/* Quick Actions */}
      

<section className="mb-5">
  <div className="grid grid-cols-4 gap-6">
    <button
      className="flex flex-col items-center space-y-1"
      onClick={() => setIsChamaOpen(true)}
    >
      <MdGroups className="text-4xl text-blue-600" />
      <span className="text-sm font-semibold text-black">Chamas</span>
    </button>

    <button
      className="flex flex-col items-center space-y-1"
      onClick={() => (window.location.href = '/wallet')}
    >
      <MdReceiptLong className="text-4xl text-green-600" />
      <span className="text-sm font-semibold text-black">History</span>
    </button>

    <button
      className="flex flex-col items-center space-y-1"
      onClick={() => (window.location.href = '/marketplace')}
    >
      <MdStore className="text-4xl text-yellow-500" />
      <span className="text-sm font-semibold text-black">Market</span>
    </button>

    <button
      className="flex flex-col items-center space-y-1"
      onClick={() => (window.location.href = '/ai-assistant')}
    >
      <MdSmartToy className="text-4xl text-purple-600" />
      <span className="text-sm font-semibold text-black">AI Help</span>
    </button>
  </div>
</section>


      
      {/* My Chamas */}
      <ChamaList onCreateChama={() => setIsChamaOpen(true)} />
      
      {/* Recent Transactions */}
      <section className="mb-5">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-base font-semibold">Recent Transactions</h2>
          <Button variant="link" className="text-primary text-xs font-medium" asChild>
            <a href="/wallet">View All</a>
          </Button>
        </div>
        
        <TransactionList limit={3} showViewAll={false} />
      </section>
      
      {/* Learning Hub Preview */}
      <section className="mb-5">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-base font-semibold">Learning Hub</h2>
          <Button variant="link" className="text-primary text-xs font-medium" asChild>
            <a href="/learning">View All</a>
          </Button>
        </div>
        
        <LearningHub limit={2} showTitle={false} />
      </section>
    </div>
  );
  
  const desktopContent = (
    <>
      <QuickActions 
        onTransfer={() => setIsTransferOpen(true)}
        onDeposit={() => setIsDepositOpen(true)}
        onWithdraw={() => setIsWithdrawOpen(true)}
        onCreateChama={() => setIsChamaOpen(true)}
      />
      
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        {/* Wallet Card */}
        <div className="flex-1">
          <WalletCard 
            onDeposit={() => setIsDepositOpen(true)}
            onTransfer={() => setIsTransferOpen(true)}
          />
        </div>
        
        {/* Recent Transactions */}
        <div className="flex-1">
          <TransactionList />
        </div>
      </div>
      
      {/* My Chamas */}
      <ChamaList onCreateChama={() => setIsChamaOpen(true)} />
      
      {/* Learning Hub */}
      <LearningHub />
      
      {/* AI Assistant */}
      <AIAssistant />
      
      {/* Marketplace Preview */}
      <MarketplacePreview />
    </>
  );
  
  return (
    <>
      {isMobile ? (
        <MobileLayout>
          {mobileContent}
        </MobileLayout>
      ) : (
        <DesktopLayout 
          title="Personal Dashboard" 
          subtitle={`Welcome back, ${firstName}. Here's your financial overview.`}
        >
          {desktopContent}
        </DesktopLayout>
      )}
      
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
              Send money to another user or chama.
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
              
              <FormItem>
                <FormLabel>Recipient</FormLabel>
                <FormControl>
                  <Input placeholder="Search for user or chama" disabled />
                </FormControl>
                <FormDescription>
                  This feature is coming soon.
                </FormDescription>
              </FormItem>
              
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
      
      {/* Create Chama Dialog */}
      <Dialog open={isChamaOpen} onOpenChange={setIsChamaOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Chama</DialogTitle>
            <DialogDescription>
              Start a new savings or investment group with friends and family.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...chamaForm}>
            <form onSubmit={chamaForm.handleSubmit(onCreateChamaSubmit)} className="space-y-4">
              <FormField
                control={chamaForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chama Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Kilimani Investment Chama" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={chamaForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., A group for real estate investments" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={chamaForm.control}
                  name="icon"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Icon</FormLabel>
                      <FormControl>
                        <select 
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          {...field}
                        >
                          <option value="groups">Group</option>
                          <option value="grass">Agriculture</option>
                          <option value="account_balance">Finance</option>
                          <option value="storefront">Business</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={chamaForm.control}
                  name="iconBg"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Theme Color</FormLabel>
                      <FormControl>
                        <select 
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          {...field}
                        >
                          <option value="primary">Blue</option>
                          <option value="secondary">Green</option>
                          <option value="accent">Orange</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <DialogFooter>
                <Button type="submit" disabled={chamaForm.formState.isSubmitting}>
                  {chamaForm.formState.isSubmitting ? "Creating..." : "Create Chama"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PersonalDashboardPage;
