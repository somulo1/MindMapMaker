import React from 'react';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { useWallet } from '@/hooks/useWallet';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface TransactionItemProps {
  type: string;
  title: string;
  subtitle: string;
  amount: number;
  currency: string;
  date: string;
}

const TransactionItem: React.FC<TransactionItemProps> = ({
  type,
  title,
  subtitle,
  amount,
  currency,
  date
}) => {
  const isIncoming = type === 'deposit' || type === 'transfer' && amount > 0;
  
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <div className={`w-8 h-8 rounded-full ${isIncoming ? 'bg-success/10' : 'bg-error/10'} flex items-center justify-center mr-3`}>
          {isIncoming ? (
            <ArrowDown className="text-success text-sm" />
          ) : (
            <ArrowUp className="text-error text-sm" />
          )}
        </div>
        <div>
          <p className="text-sm font-medium">{title}</p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">{subtitle}</p>
        </div>
      </div>
      <div className="text-right">
        <p className={`text-sm font-medium ${isIncoming ? 'text-success' : 'text-error'}`}>
          {isIncoming ? '+' : '-'}{formatCurrency(Math.abs(amount), currency)}
        </p>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">{date}</p>
      </div>
    </div>
  );
};

interface TransactionListProps {
  limit?: number;
  showViewAll?: boolean;
}

const TransactionList: React.FC<TransactionListProps> = ({ 
  limit = 3,
  showViewAll = true 
}) => {
  const { transactions, wallet, isLoading } = useWallet();
  
  const limitedTransactions = transactions.slice(0, limit);
  const currency = wallet?.currency || 'KES';

  const getTransactionTitle = (transaction: any) => {
    switch (transaction.type) {
      case 'deposit':
        return 'Deposit';
      case 'withdraw':
        return 'Withdrawal';
      case 'transfer':
        return transaction.amount > 0 ? 'Received Transfer' : 'Sent Transfer';
      case 'contribution':
        return 'Chama Contribution';
      default:
        return transaction.type;
    }
  };

  const getTransactionSubtitle = (transaction: any) => {
    return transaction.description || transaction.type;
  };

  return (
    <Card className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm">
      <CardContent className="p-4">
        <h3 className="font-medium mb-3">Recent Transactions</h3>
        
        {isLoading ? (
          <div className="space-y-3">
            <div className="h-12 skeleton rounded"></div>
            <div className="h-12 skeleton rounded"></div>
            <div className="h-12 skeleton rounded"></div>
          </div>
        ) : limitedTransactions.length > 0 ? (
          <div className="space-y-3">
            {limitedTransactions.map((transaction: any) => (
              <TransactionItem
                key={transaction.id}
                type={transaction.type}
                title={getTransactionTitle(transaction)}
                subtitle={getTransactionSubtitle(transaction)}
                amount={transaction.amount}
                currency={currency}
                date={formatDate(transaction.createdAt)}
              />
            ))}
          </div>
        ) : (
          <p className="text-center text-neutral-500 dark:text-neutral-400 py-4">
            No transactions yet.
          </p>
        )}
        
        {showViewAll && (
          <Button variant="link" className="w-full mt-3 text-center text-primary text-sm font-medium" asChild>
            <a href="/wallet">View All Transactions</a>
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default TransactionList;
