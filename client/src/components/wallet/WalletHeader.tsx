import React from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface WalletHeaderProps {
  balance: number;
  currency: string;
  showBalance: boolean;
  onToggleVisibility: () => void;
}

const WalletHeader: React.FC<WalletHeaderProps> = ({ 
  balance, 
  currency, 
  showBalance, 
  onToggleVisibility 
}) => {
  const formattedBalance = formatCurrency(balance, currency);
  
  return (
    <div className="bg-gradient-to-r from-primary to-primary-light rounded-xl p-6 text-white mb-6">
      <div className="flex justify-between items-start mb-2">
        <span className="text-sm opacity-90">Available Balance</span>
        <button onClick={onToggleVisibility} className="text-white">
          {showBalance ? <Eye size={20} /> : <EyeOff size={20} />}
        </button>
      </div>
      
      <p className="text-3xl font-bold mb-4">
        {showBalance ? formattedBalance : '•••••••••'}
      </p>
      
      <p className="text-xs opacity-90 mb-2">Your personal wallet for savings and transactions</p>
      
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-6">
        <div className="bg-white/10 rounded p-2 text-center">
          <p className="text-xs opacity-90">This Month</p>
          <p className="font-bold">{showBalance ? '+KES 12,500' : '•••••'}</p>
        </div>
        
        <div className="bg-white/10 rounded p-2 text-center">
          <p className="text-xs opacity-90">Spent</p>
          <p className="font-bold">{showBalance ? '-KES 8,200' : '•••••'}</p>
        </div>
        
        <div className="bg-white/10 rounded p-2 text-center">
          <p className="text-xs opacity-90">Chama Contrib.</p>
          <p className="font-bold">{showBalance ? 'KES 5,000' : '•••••'}</p>
        </div>
        
        <div className="bg-white/10 rounded p-2 text-center">
          <p className="text-xs opacity-90">Savings Goal</p>
          <p className="font-bold">{showBalance ? '65%' : '•••••'}</p>
        </div>
      </div>
    </div>
  );
};

export default WalletHeader;
