import React from 'react';
import { Send, Plus, Wallet, Users } from 'lucide-react';

interface QuickActionProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

const QuickAction: React.FC<QuickActionProps> = ({ icon, label, onClick }) => {
  return (
    <button 
      onClick={onClick}
      className="flex flex-col items-center p-4 bg-white dark:bg-neutral-800 rounded-xl shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="w-12 h-12 rounded-full bg-primary-light/10 flex items-center justify-center mb-2">
        {icon}
      </div>
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
};

interface QuickActionsProps {
  onTransfer: () => void;
  onDeposit: () => void;
  onWithdraw: () => void;
  onCreateChama: () => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({
  onTransfer,
  onDeposit,
  onWithdraw,
  onCreateChama
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <QuickAction 
        icon={<Send className="text-primary" />}
        label="Send Money"
        onClick={onTransfer}
      />
      <QuickAction 
        icon={<Plus className="text-secondary" />}
        label="Deposit"
        onClick={onDeposit}
      />
      <QuickAction 
        icon={<Wallet className="text-accent-dark" />}
        label="Withdraw"
        onClick={onWithdraw}
      />
      <QuickAction 
        icon={<Users className="text-primary" />}
        label="Create Chama"
        onClick={onCreateChama}
      />
    </div>
  );
};

export default QuickActions;
