import React, { useState } from 'react';
import { useMediaQuery } from '@/hooks/use-mobile';
import UserLayout from '@/components/layout/UserLayout';
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
import CreateChamaDialog from '@/components/chama/CreateChamaDialog';

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
    <div className="space-y-6">
      {/* Welcome Section */}
      <section>
        <h1 className="text-xl font-bold mb-1">Hello, {firstName}</h1>
        <p className="text-neutral-500 dark:text-neutral-400 text-sm">Welcome to your financial hub</p>
      </section>
      
      {/* Wallet Card */}
      <WalletCard
        onDeposit={() => navigate("/wallet/#deposit")}
        onTransfer={() => navigate("/wallet/#transfer")}
      />
      
      {/* Quick Actions */}
      <section>
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
            onClick={() => navigate('/wallet')}
          >
            <MdReceiptLong className="text-4xl text-green-600" />
            <span className="text-sm font-semibold text-black">History</span>
          </button>

          <button
            className="flex flex-col items-center space-y-1"
            onClick={() => navigate('/marketplace')}
          >
            <MdStore className="text-4xl text-yellow-500" />
            <span className="text-sm font-semibold text-black">Market</span>
          </button>

          <button
            className="flex flex-col items-center space-y-1"
            onClick={() => navigate('/ai-assistant')}
          >
            <MdSmartToy className="text-4xl text-purple-600" />
            <span className="text-sm font-semibold text-black">AI Help</span>
          </button>
        </div>
      </section>
      
      {/* My Chamas - Mobile */}
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-base font-semibold">My Chamas</h2>
          <Button variant="link" className="text-primary text-xs font-medium" asChild>
            <a href="/chamas">View All</a>
          </Button>
        </div>
        <div className="overflow-x-auto pb-2">
          <ChamaList onCreateChama={() => setIsChamaOpen(true)} />
        </div>
      </section>
      
      {/* Learning Hub Preview - Mobile */}
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-base font-semibold">Learning Hub</h2>
          <Button variant="link" className="text-primary text-xs font-medium" asChild>
            <a href="/learning">View All</a>
          </Button>
        </div>
        <div className="overflow-x-auto pb-2">
          <LearningHub limit={2} showTitle={false} />
        </div>
      </section>
      
      {/* Recent Transactions */}
      <section>
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-base font-semibold">Recent Transactions</h2>
          <Button variant="link" className="text-primary text-xs font-medium" asChild>
            <a href="/wallet">View All</a>
          </Button>
        </div>
        
        <TransactionList limit={6} showViewAll={false} />
      </section>
    </div>
  );
  
  const desktopContent = (
    <div className="space-y-6">
      <QuickActions
        onTransfer={() => navigate("/wallet/#transfer")}
        onDeposit={() => navigate("/wallet/#deposit")}
        onWithdraw={() => navigate("/wallet/#withdraw")}
        onCreateChama={() => setIsChamaOpen(true)}
      />
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Wallet Card */}
        <div>
          <WalletCard
            onDeposit={() => navigate("/wallet/#deposit")}
            onTransfer={() => navigate("/wallet/#transfer")}
          />
        </div>
        
        {/* Recent Transactions */}
        <div>
          <TransactionList />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* My Chamas - Desktop */}
        <div className="bg-white dark:bg-neutral-900 rounded-lg p-4 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">My Chamas</h2>
            <Button variant="link" className="text-primary text-sm font-medium" asChild>
              <a href="/chamas">View All</a>
            </Button>
          </div>
          <div className="overflow-y-auto max-h-[400px]">
            <ChamaList onCreateChama={() => setIsChamaOpen(true)} />
          </div>
        </div>
        
        {/* Learning Hub - Desktop */}
        <div className="bg-white dark:bg-neutral-900 rounded-lg p-4 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Learning Hub</h2>
            <Button variant="link" className="text-primary text-sm font-medium" asChild>
              <a href="/learning">View All</a>
            </Button>
          </div>
          <div className="overflow-y-auto max-h-[400px]">
            <LearningHub limit={3} />
          </div>
        </div>
      </div>
      
      {/* AI Assistant Preview */}
      <AIAssistant />
      
      {/* Marketplace Preview */}
      <MarketplacePreview />
    </div>
  );

  return (
    <UserLayout title="Dashboard">
      <div className="max-w-7xl mx-auto">
        {isMobile ? mobileContent : desktopContent}
      </div>

      <CreateChamaDialog 
        open={isChamaOpen} 
        onOpenChange={setIsChamaOpen} 
      />
    </UserLayout>
  );
};

export default PersonalDashboardPage;
