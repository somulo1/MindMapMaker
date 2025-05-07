import React from 'react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ArrowDown, ArrowUp, HelpCircle } from 'lucide-react';

interface Transaction {
  id: number;
  type: string;
  amount: number;
  description?: string;
  status: string;
  createdAt: string;
}

interface TransactionHistoryListProps {
  transactions: Transaction[];
}

const TransactionHistoryList: React.FC<TransactionHistoryListProps> = ({ transactions }) => {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-neutral-500 dark:text-neutral-400">No transactions yet.</p>
      </div>
    );
  }
  
  const getTransactionIcon = (type: string, amount: number) => {
    if (type === 'deposit' || (type === 'transfer' && amount > 0)) {
      return <ArrowDown className="text-success h-4 w-4" />;
    } else if (type === 'withdrawal' || type === 'contribution' || (type === 'transfer' && amount < 0)) {
      return <ArrowUp className="text-destructive h-4 w-4" />;
    } else {
      return <HelpCircle className="text-neutral-500 h-4 w-4" />;
    }
  };
  
  const getTransactionColor = (type: string, amount: number) => {
    if (type === 'deposit' || (type === 'transfer' && amount > 0)) {
      return 'text-success';
    } else if (type === 'withdrawal' || type === 'contribution' || (type === 'transfer' && amount < 0)) {
      return 'text-destructive';
    } else {
      return 'text-neutral-700 dark:text-neutral-300';
    }
  };
  
  const getTransactionTitle = (transaction: Transaction) => {
    switch (transaction.type) {
      case 'deposit':
        return 'Deposit';
      case 'withdrawal':
        return 'Withdrawal';
      case 'transfer':
        return transaction.amount > 0 ? 'Received Transfer' : 'Sent Transfer';
      case 'contribution':
        return 'Chama Contribution';
      default:
        return transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1);
    }
  };
  
  const getTransactionSubtitle = (transaction: Transaction) => {
    return transaction.description || `Transaction #${transaction.id}`;
  };
  
  return (
    <div className="space-y-4">
      {transactions.map((transaction) => (
        <div key={transaction.id} className="flex items-center p-3 hover:bg-neutral-50 dark:hover:bg-neutral-900 rounded-lg transition-colors">
          <div className={`w-10 h-10 rounded-full ${
            transaction.type === 'deposit' || (transaction.type === 'transfer' && transaction.amount > 0)
              ? 'bg-success/10'
              : 'bg-destructive/10'
          } flex items-center justify-center mr-3`}>
            {getTransactionIcon(transaction.type, transaction.amount)}
          </div>
          
          <div className="flex-1">
            <div className="flex justify-between">
              <h4 className="font-medium text-sm">{getTransactionTitle(transaction)}</h4>
              <span className={`font-semibold ${getTransactionColor(transaction.type, transaction.amount)}`}>
                {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount, 'KES')}
              </span>
            </div>
            
            <div className="flex justify-between mt-1">
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {getTransactionSubtitle(transaction)}
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {formatDate(transaction.createdAt)}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TransactionHistoryList;
