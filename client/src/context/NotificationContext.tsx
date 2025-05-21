import React, { createContext, useContext, useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Notification } from '@shared/schema';

interface NotificationContextType {
  isOpen: boolean;
  openNotifications: () => void;
  closeNotifications: () => void;
  unreadCount: number;
  notifications: Notification[];
  isLoading: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const { data: notifications = [], isLoading } = useQuery<Notification[]>({
    queryKey: ['/api/notifications'],
  });

  const openNotifications = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeNotifications = useCallback(() => {
    setIsOpen(false);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

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