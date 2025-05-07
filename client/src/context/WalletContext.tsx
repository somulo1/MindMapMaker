import React, { createContext, useContext, useState } from 'react';
import { useAuth } from './AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

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

interface TransactionPayload {
  type: 'deposit' | 'withdraw' | 'transfer' | 'contribution';
  amount: number;
  description?: string;
  chamaId?: number;
  destinationUserId?: number;
  destinationChamaId?: number;
}

interface WalletContextType {
  userWallet: Wallet | null;
  chamaWallet: Wallet | null;
  userTransactions: Transaction[];
  chamaTransactions: Transaction[];
  currentChamaId: number | null;
  depositFunds: (amount: number, description?: string) => Promise<any>;
  withdrawFunds: (amount: number, description?: string) => Promise<any>;
  transferFunds: (amount: number, destinationUserId: number, description?: string) => Promise<any>;
  contributeToChamaFunds: (amount: number, chamaId: number, description?: string) => Promise<any>;
  setChamaId: (chamaId: number | null) => void;
  isLoading: boolean;
  error: string | null;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [currentChamaId, setCurrentChamaId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch user wallet
  const { data: userWalletData, isLoading: isLoadingUserWallet } = useQuery({
    queryKey: ['/api/wallets/user'],
    enabled: !!user,
  });
  
  // Fetch chama wallet when a chama is selected
  const { data: chamaWalletData, isLoading: isLoadingChamaWallet } = useQuery({
    queryKey: ['/api/wallets/chama', currentChamaId],
    enabled: !!user && !!currentChamaId,
  });
  
  // Fetch user transactions
  const { data: userTransactionsData, isLoading: isLoadingUserTransactions } = useQuery({
    queryKey: ['/api/transactions/user'],
    enabled: !!user,
  });
  
  // Fetch chama transactions when a chama is selected
  const { data: chamaTransactionsData, isLoading: isLoadingChamaTransactions } = useQuery({
    queryKey: ['/api/transactions/chama', currentChamaId],
    enabled: !!user && !!currentChamaId,
  });
  
  // Create transaction mutation
  const createTransactionMutation = useMutation({
    mutationFn: async (transactionData: TransactionPayload) => {
      try {
        const res = await apiRequest('POST', '/api/transactions', transactionData);
        return await res.json();
      } catch (error) {
        throw new Error(error.message || 'Transaction failed');
      }
    },
    onSuccess: (data) => {
      // Invalidate and refetch wallet queries
      queryClient.invalidateQueries({ queryKey: ['/api/wallets/user'] });
      queryClient.invalidateQueries({ queryKey: ['/api/transactions/user'] });
      
      if (currentChamaId) {
        queryClient.invalidateQueries({ queryKey: ['/api/wallets/chama', currentChamaId] });
        queryClient.invalidateQueries({ queryKey: ['/api/transactions/chama', currentChamaId] });
      }
      
      setError(null);
    },
    onError: (error: Error) => {
      setError(error.message || 'Transaction failed');
    },
  });
  
  // Deposit funds to user wallet
  const depositFunds = async (amount: number, description?: string) => {
    return createTransactionMutation.mutateAsync({
      type: 'deposit',
      amount,
      description
    });
  };
  
  // Withdraw funds from user wallet
  const withdrawFunds = async (amount: number, description?: string) => {
    return createTransactionMutation.mutateAsync({
      type: 'withdraw',
      amount,
      description
    });
  };
  
  // Transfer funds to another user
  const transferFunds = async (amount: number, destinationUserId: number, description?: string) => {
    return createTransactionMutation.mutateAsync({
      type: 'transfer',
      amount,
      destinationUserId,
      description
    });
  };
  
  // Contribute funds to a chama
  const contributeToChamaFunds = async (amount: number, chamaId: number, description?: string) => {
    return createTransactionMutation.mutateAsync({
      type: 'contribution',
      amount,
      chamaId,
      description: description || 'Chama Contribution'
    });
  };
  
  // Set current chama ID
  const setChamaId = (chamaId: number | null) => {
    setCurrentChamaId(chamaId);
  };
  
  const value = {
    userWallet: userWalletData?.wallet || null,
    chamaWallet: chamaWalletData?.wallet || null,
    userTransactions: userTransactionsData?.transactions || [],
    chamaTransactions: chamaTransactionsData?.transactions || [],
    currentChamaId,
    depositFunds,
    withdrawFunds,
    transferFunds,
    contributeToChamaFunds,
    setChamaId,
    isLoading: isLoadingUserWallet || isLoadingChamaWallet || 
               isLoadingUserTransactions || isLoadingChamaTransactions || 
               createTransactionMutation.isPending,
    error
  };
  
  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
