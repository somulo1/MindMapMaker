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
import { useWallet } from '@/hooks/useWallet';
import { useChama } from '@/hooks/useChama';
import { useToast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from '@/components/ui/form';
import {useLocation} from "wouter";

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

    /// Routing with wouter
    const [_, navigate] = useLocation();

    /// Dialog states
  const [isChamaOpen, setIsChamaOpen] = useState(false);
  
  const chamaForm = useForm<z.infer<typeof createChamaSchema>>({
    resolver: zodResolver(createChamaSchema),
    defaultValues: { 
      name: "", 
      description: "", 
      icon: "groups", 
      iconBg: "primary" 
    },
  });
  
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
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to create chama",
          description: error?.message || "An error occurred while creating the chama.",
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
          onDeposit={() => navigate("/wallet/#deposit")}
          onTransfer={() => navigate("/wallet/#transfer")}
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
          onTransfer={() => navigate("/wallet/#transfer")}
          onDeposit={() => navigate("/wallet/#deposit")}
          onWithdraw={() => navigate("/wallet/#withdraw")}
        onCreateChama={() => setIsChamaOpen(true)}
      />
      
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        {/* Wallet Card */}
        <div className="flex-1">
          <WalletCard
              onDeposit={() => navigate("/wallet/#deposit")}
              onTransfer={() => navigate("/wallet/#transfer")}
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
