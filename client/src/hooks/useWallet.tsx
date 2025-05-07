import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/context/AuthContext';

interface Wallet {
  id: number;
  userId?: number;
  chamaId?: number;
  balance: number;
  currency: string;
  lastUpdated: string;
}

interface Transaction {
  id: number;
  userId?: number;
  chamaId?: number;
  type: string;
  amount: number;
  description?: string;
  sourceWallet?: number;
  destinationWallet?: number;
  status: string;
  createdAt: string;
}

export function useWallet() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  
  // Fetch user wallet
  const { data: userWalletData, isLoading: isLoadingUserWallet } = useQuery({
    queryKey: ['/api/wallets/user'],
    enabled: !!user,
  });
  
  // Fetch user transactions
  const { data: userTransactionsData, isLoading: isLoadingUserTransactions } = useQuery({
    queryKey: ['/api/transactions/user'],
    enabled: !!user,
  });
  
  // Create transaction mutation
  const createTransactionMutation = useMutation({
    mutationFn: async (transactionData: {
      type: 'deposit' | 'withdraw' | 'transfer' | 'contribution';
      amount: number;
      description?: string;
      chamaId?: number;
      destinationUserId?: number;
      destinationChamaId?: number;
    }) => {
      try {
        const res = await apiRequest('POST', '/api/transactions', transactionData);
        return await res.json();
      } catch (error) {
        throw new Error(error.message || 'Transaction failed');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/wallets/user'] });
      queryClient.invalidateQueries({ queryKey: ['/api/transactions/user'] });
      setError(null);
    },
    onError: (error: Error) => {
      setError(error.message || 'Transaction failed');
    },
  });
  
  // Deposit funds
  const deposit = async (amount: number, phoneNumber: string, description?: string) => {
    const response = await fetch('/api/mpesa/initiate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, phoneNumber, description })
    });
    
    if (!response.ok) {
      throw new Error('Failed to initiate M-PESA payment');
    }
    
    return response.json();
  };
  
  // Withdraw funds
  const withdraw = async (amount: number, description?: string) => {
    return createTransactionMutation.mutateAsync({
      type: 'withdraw',
      amount,
      description: description || 'Withdrawal'
    });
  };
  
  // Transfer funds to another user
  const transfer = async (amount: number, destinationUserId: number, description?: string) => {
    return createTransactionMutation.mutateAsync({
      type: 'transfer',
      amount,
      destinationUserId,
      description: description || 'Transfer to user'
    });
  };
  
  // Contribute to chama
  const contribute = async (amount: number, chamaId: number, description?: string) => {
    return createTransactionMutation.mutateAsync({
      type: 'contribution',
      amount,
      chamaId,
      description: description || 'Chama Contribution'
    });
  };
  
  return {
    wallet: userWalletData?.wallet as Wallet | null,
    transactions: userTransactionsData?.transactions as Transaction[] || [],
    deposit,
    withdraw,
    transfer,
    contribute,
    isLoading: isLoadingUserWallet || isLoadingUserTransactions || createTransactionMutation.isPending,
    error
  };
}
