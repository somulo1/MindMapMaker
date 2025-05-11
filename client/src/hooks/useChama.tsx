import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/context/AuthContext';
import { useLocation } from 'wouter';

interface Chama {
  id: number;
  name: string;
  description?: string;
  icon: string;
  iconBg: string;
  memberCount: number;
  balance: number;
  establishedDate: string;
  nextMeeting?: string;
  createdBy: number;
  createdAt: string;
}

interface ChamaMember {
  id: number;
  chamaId: number;
  userId: number;
  role: string;
  contributionAmount?: number;
  contributionFrequency?: string;
  rating: number;
  isActive: boolean;
  joinedAt: string;
  user?: {
    id: number;
    username: string;
    fullName: string;
    email: string;
    profilePic?: string;
    location?: string;
  };
}

interface CreateChamaData {
  name: string;
  description?: string;
  icon?: string;
  iconBg?: string;
  nextMeeting?: string;
}

interface AddMemberData {
  userId: number;
  role?: string;
  contributionAmount?: number;
  contributionFrequency?: string;
}

export function useChama() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [currentChamaId, setCurrentChamaId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, setLocation] = useLocation();
  
  // Fetch user's chamas
  const { data: chamasData, isLoading: isLoadingChamas } = useQuery({
    queryKey: ['/api/chamas'],
    enabled: !!user,
  });
  
  // Fetch current chama details
  const { data: currentChamaData, isLoading: isLoadingCurrentChama } = useQuery({
    queryKey: ['/api/chamas', currentChamaId],
    enabled: !!user && !!currentChamaId,
  });
  
  // Fetch chama members
  const { data: chamaMembersData, isLoading: isLoadingChamaMembers } = useQuery({
    queryKey: ['/api/chamas', currentChamaId, 'members'],
    enabled: !!user && !!currentChamaId,
  });
  
  // Create chama mutation
  const createChamaMutation = useMutation({
    mutationFn: async (chamaData: CreateChamaData) => {
      try {
        const res = await apiRequest('POST', '/api/chamas', chamaData);
        const data = await res.json();
        if (!data.chama) {
          throw new Error('Invalid response from server');
        }
        return data;
      } catch (error: any) {
        throw new Error(error.message || 'Failed to create chama');
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/chamas'] });
      
      // Set the newly created chama as current
      if (data.chama?.id) {
        setCurrentChamaId(data.chama.id);
        
        // Navigate to the new chama's details page
        setLocation(`/chamas/${data.chama.id}`);
      } else {
        throw new Error('Failed to get chama ID from response');
      }
      
      setError(null);
    },
    onError: (error: Error) => {
      setError(error.message || 'Failed to create chama');
    },
  });
  
  // Add member mutation
  const addMemberMutation = useMutation({
    mutationFn: async ({ chamaId, memberData }: { chamaId: number; memberData: AddMemberData }) => {
      try {
        const res = await apiRequest('POST', `/api/chamas/${chamaId}/members`, memberData);
        return await res.json();
      } catch (error: any) {
        throw new Error(error.message || 'Failed to add member');
      }
    },
    onSuccess: () => {
      if (currentChamaId) {
        queryClient.invalidateQueries({ queryKey: ['/api/chamas', currentChamaId, 'members'] });
        queryClient.invalidateQueries({ queryKey: ['/api/chamas', currentChamaId] });
      }
      queryClient.invalidateQueries({ queryKey: ['/api/chamas'] });
      
      setError(null);
    },
    onError: (error: Error) => {
      setError(error.message || 'Failed to add member');
    },
  });
  
  // Create a new chama
  const createChama = async (chamaData: CreateChamaData) => {
    return createChamaMutation.mutateAsync(chamaData);
  };
  
  // Add a member to the current chama
  const addMember = async (memberData: AddMemberData) => {
    if (!currentChamaId) {
      setError('No chama selected');
      return Promise.reject(new Error('No chama selected'));
    }
    
    return addMemberMutation.mutateAsync({
      chamaId: currentChamaId,
      memberData
    });
  };
  
  // Set current chama
  const selectChama = (chamaId: number) => {
    setCurrentChamaId(chamaId);
  };
  
  return {
    chamas: chamasData?.chamas || [],
    currentChama: currentChamaData?.chama || null,
    chamaMembers: chamaMembersData?.members || [],
    createChama,
    addMember,
    selectChama,
    currentChamaId,
    isLoading: isLoadingChamas || isLoadingCurrentChama || isLoadingChamaMembers || 
               createChamaMutation.isPending || addMemberMutation.isPending,
    error
  };
}
