import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import { useWallet } from '@/hooks/useWallet';
import { formatCurrency } from '@/lib/utils';

interface WalletCardProps {
  onDeposit: () => void;
  onTransfer: () => void;
}

const WalletCard: React.FC<WalletCardProps> = ({ onDeposit, onTransfer }) => {
  const { wallet, isLoading } = useWallet();
  const [showBalance, setShowBalance] = React.useState(true);

  const toggleBalanceVisibility = () => {
    setShowBalance(prev => !prev);
  };

  const formattedBalance = wallet ? formatCurrency(wallet.balance, wallet.currency) : 'KES 0.00';
  const lastUpdated = wallet 
    ? new Date(wallet.lastUpdated).toLocaleString('en-US', { 
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
        month: 'short',
        day: 'numeric',
      })
    : 'Not available';

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm p-5 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">My Wallet</h2>
        <Button variant="link" className="text-primary text-sm font-medium flex items-center" asChild>
          <a href="/wallet">
            Manage <span className="ml-1">→</span>
          </a>
        </Button>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4">
        {/* Balance Card */}
        <div className="flex-1 bg-gradient-to-r from-primary to-primary-light rounded-xl p-4 text-white">
          <div className="flex justify-between items-start mb-2">
            <span className="text-sm opacity-90">Available Balance</span>
            <button onClick={toggleBalanceVisibility} className="text-white">
              {showBalance ? <Eye size={20} /> : <EyeOff size={20} />}
            </button>
          </div>
          <p className="text-2xl font-bold mb-1">
            {isLoading 
              ? <span className="skeleton bg-white/20 h-8 w-32 block rounded"></span>
              : showBalance 
                ? formattedBalance 
                : '••••••'}
          </p>
          <p className="text-xs opacity-90">Last updated: {lastUpdated}</p>
          <div className="flex mt-4 space-x-2">
            <button 
              onClick={onDeposit}
              className="bg-white/20 hover:bg-white/30 text-white text-sm py-1 px-3 rounded-full transition-colors"
            >
              Top Up
            </button>
            <button 
              onClick={onTransfer}
              className="bg-white/20 hover:bg-white/30 text-white text-sm py-1 px-3 rounded-full transition-colors"
            >
              Transfer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletCard;
