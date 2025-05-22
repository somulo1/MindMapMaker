import React, { createContext, useContext, useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChamaInvitation } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';

interface InvitationWithDetails {
  id: number;
  chamaId: number;
  role: string;
  status: string;
  invitedAt: string;
  chama: {
    id: number;
    name: string;
    icon: string;
    iconBg: string;
  };
  invitedByUser: {
    id: number;
    fullName: string;
  };
}

interface NotificationContextType {
  isOpen: boolean;
  openNotifications: () => void;
  closeNotifications: () => void;
  unreadCount: number;
  notifications: InvitationWithDetails[];
  isLoading: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const { data: invitationsResponse, isLoading } = useQuery<{ invitations: InvitationWithDetails[] }>({
    queryKey: ['/api/invitations'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/invitations');
      return response.json();
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    refetchOnWindowFocus: true,
    staleTime: 10000 // Consider data stale after 10 seconds
  });

  const notifications = invitationsResponse?.invitations || [];

  const openNotifications = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeNotifications = useCallback(() => {
    setIsOpen(false);
  }, []);

  const unreadCount = notifications.filter(n => n.status === 'pending').length;

  return (
    <NotificationContext.Provider
      value={{
        isOpen,
        openNotifications,
        closeNotifications,
        unreadCount,
        notifications,
        isLoading
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
} 