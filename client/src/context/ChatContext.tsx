import React, { createContext, useContext, useState, useEffect } from 'react';
import { useWebSocket } from '@/lib/socketClient';
import { useAuth } from './AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface Message {
  id: number;
  senderId: number;
  receiverId?: number;
  chamaId?: number;
  content: string;
  isRead: boolean;
  sentAt: string;
  sender?: {
    id: number;
    username: string;
    fullName: string;
    profilePic?: string;
  };
  receiver?: {
    id: number;
    name: string;
    type: 'user' | 'chama';
    profilePic?: string;
  };
}

interface ChatContextType {
  messages: Message[];
  chamaMessages: Message[];
  currentChamaId: number | null;
  sendDirectMessage: (receiverId: number, content: string) => boolean;
  sendChamaMessage: (content: string) => boolean;
  joinChamaChat: (chamaId: number) => void;
  markMessageAsRead: (messageId: number) => void;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [messages, setMessages] = useState<Message[]>([]);
  const [chamaMessages, setChamaMessages] = useState<Message[]>([]);
  const [currentChamaId, setCurrentChamaId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Initialize WebSocket
  const {
    isConnected,
    isAuthenticated,
    error: wsError,
    registerHandler,
    joinChamaChat: wsJoinChamaChat,
    sendDirectMessage: wsSendDirectMessage,
    sendChamaMessage: wsSendChamaMessage,
    markMessageAsRead: wsMarkMessageAsRead
  } = useWebSocket({
    userId: user?.id || null
  });
  
  // Fetch user messages
  const { data: userMessagesData, isLoading: isLoadingUserMessages } = useQuery({
    queryKey: ['/api/messages/user'],
    enabled: !!user,
  });
  
  // Fetch chama messages when a chama is selected
  const { data: chamaMessagesData, isLoading: isLoadingChamaMessages } = useQuery({
    queryKey: ['/api/messages/chama', currentChamaId],
    enabled: !!user && !!currentChamaId,
  });
  
  // Create message mutation
  const createMessageMutation = useMutation({
    mutationFn: async (messageData: { content: string; receiverId?: number; chamaId?: number }) => {
      try {
        const res = await apiRequest('POST', '/api/messages', messageData);
        return await res.json();
      } catch (error) {
        throw new Error(error.message || 'Failed to send message');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/messages/user'] });
      if (currentChamaId) {
        queryClient.invalidateQueries({ queryKey: ['/api/messages/chama', currentChamaId] });
      }
    },
    onError: (error: Error) => {
      setError(error.message || 'Failed to send message');
    },
  });
  
  // Update messages when data changes
  useEffect(() => {
    if (userMessagesData?.messages) {
      setMessages(userMessagesData.messages);
    }
  }, [userMessagesData]);
  
  useEffect(() => {
    if (chamaMessagesData?.messages) {
      setChamaMessages(chamaMessagesData.messages);
    }
  }, [chamaMessagesData]);
  
  // Register WebSocket message handlers
  useEffect(() => {
    if (!isConnected || !isAuthenticated) return;
    
    // Handle direct messages
    const unregisterDirectMessage = registerHandler('direct_message', (data) => {
      if (data.message) {
        setMessages(prevMessages => [data.message, ...prevMessages]);
      }
    });
    
    // Handle chama messages
    const unregisterChamaMessage = registerHandler('chama_message', (data) => {
      if (data.message && data.message.chamaId === currentChamaId) {
        setChamaMessages(prevMessages => [data.message, ...prevMessages]);
      }
    });
    
    // Handle message read receipts
    const unregisterMessageRead = registerHandler('message_read', (data) => {
      if (data.messageId) {
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            msg.id === data.messageId ? { ...msg, isRead: true } : msg
          )
        );
        
        setChamaMessages(prevMessages => 
          prevMessages.map(msg => 
            msg.id === data.messageId ? { ...msg, isRead: true } : msg
          )
        );
      }
    });
    
    return () => {
      unregisterDirectMessage();
      unregisterChamaMessage();
      unregisterMessageRead();
    };
  }, [isConnected, isAuthenticated, registerHandler, currentChamaId]);
  
  // Join chama chat
  const joinChamaChat = (chamaId: number) => {
    setCurrentChamaId(chamaId);
    if (isConnected && isAuthenticated) {
      wsJoinChamaChat(chamaId);
    }
  };
  
  // Send direct message
  const sendDirectMessage = (receiverId: number, content: string) => {
    if (isConnected && isAuthenticated) {
      // Try WebSocket first
      const success = wsSendDirectMessage(receiverId, content);
      if (success) return true;
    }
    
    // Fall back to REST API
    createMessageMutation.mutate({ content, receiverId });
    return true;
  };
  
  // Send chama message
  const sendChamaMessage = (content: string) => {
    if (!currentChamaId) {
      setError('No chama selected');
      return false;
    }
    
    if (isConnected && isAuthenticated) {
      // Try WebSocket first
      const success = wsSendChamaMessage(currentChamaId, content);
      if (success) return true;
    }
    
    // Fall back to REST API
    createMessageMutation.mutate({ content, chamaId: currentChamaId });
    return true;
  };
  
  // Mark message as read
  const markMessageAsRead = (messageId: number) => {
    if (isConnected && isAuthenticated) {
      // Try WebSocket first
      wsMarkMessageAsRead(messageId);
      return;
    }
    
    // No REST API fallback currently
  };
  
  const value = {
    messages,
    chamaMessages,
    currentChamaId,
    sendDirectMessage,
    sendChamaMessage,
    joinChamaChat,
    markMessageAsRead,
    isConnected,
    isLoading: isLoadingUserMessages || isLoadingChamaMessages || createMessageMutation.isPending,
    error: error || wsError
  };
  
  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
