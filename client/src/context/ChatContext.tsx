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
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/messages');
      return res.json();
    },
    enabled: !!user,
    staleTime: 30 * 1000, // Consider data fresh for 30 seconds
    cacheTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
  });
  
  // Fetch chama messages when a chama is selected
  const { data: chamaMessagesData, isLoading: isLoadingChamaMessages } = useQuery({
    queryKey: ['/api/messages/chama', currentChamaId],
    queryFn: async () => {
      if (!currentChamaId) throw new Error('No chama selected');
      const res = await apiRequest('GET', `/api/chamas/${currentChamaId}/messages`);
      return res.json();
    },
    enabled: !!user && !!currentChamaId,
    staleTime: 30 * 1000, // Consider data fresh for 30 seconds
    cacheTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
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
      setMessages(prevMessages => {
        // Merge new messages with existing ones, avoiding duplicates
        const messageMap = new Map();
        [...prevMessages, ...userMessagesData.messages].forEach(msg => {
          messageMap.set(msg.id, msg);
        });
        return Array.from(messageMap.values())
          .sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());
      });
    }
  }, [userMessagesData]);
  
  useEffect(() => {
    if (chamaMessagesData?.messages) {
      setChamaMessages(prevMessages => {
        // Merge new messages with existing ones, avoiding duplicates
        const messageMap = new Map();
        [...prevMessages, ...chamaMessagesData.messages].forEach(msg => {
          messageMap.set(msg.id, msg);
        });
        return Array.from(messageMap.values())
          .sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());
      });
    }
  }, [chamaMessagesData]);
  
  // Register WebSocket message handlers
  useEffect(() => {
    if (!isConnected || !isAuthenticated) return;
    
    // Handle direct messages
    const unregisterDirectMessage = registerHandler('direct_message', (data) => {
      if (data.message) {
        setMessages(prevMessages => {
          const messageMap = new Map();
          [...prevMessages, data.message].forEach(msg => {
            messageMap.set(msg.id, msg);
          });
          return Array.from(messageMap.values())
            .sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());
        });
        
        // Update React Query cache
        queryClient.setQueryData(['/api/messages/user'], (oldData: any) => {
          if (!oldData) return { messages: [data.message] };
          const messageMap = new Map();
          [...oldData.messages, data.message].forEach(msg => {
            messageMap.set(msg.id, msg);
          });
          return { messages: Array.from(messageMap.values()) };
        });
      }
    });
    
    // Handle chama messages
    const unregisterChamaMessage = registerHandler('chama_message', (data) => {
      if (data.message && data.message.chamaId === currentChamaId) {
        setChamaMessages(prevMessages => {
          const messageMap = new Map();
          [...prevMessages, data.message].forEach(msg => {
            messageMap.set(msg.id, msg);
          });
          return Array.from(messageMap.values())
            .sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());
        });
        
        // Update React Query cache
        queryClient.setQueryData(['/api/messages/chama', currentChamaId], (oldData: any) => {
          if (!oldData) return { messages: [data.message] };
          const messageMap = new Map();
          [...oldData.messages, data.message].forEach(msg => {
            messageMap.set(msg.id, msg);
          });
          return { messages: Array.from(messageMap.values()) };
        });
      }
    });
    
    // Handle message read receipts
    const unregisterMessageRead = registerHandler('message_read', (data) => {
      if (data.messageId) {
        // Update local state
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
        
        // Update React Query cache for user messages
        queryClient.setQueryData(['/api/messages/user'], (oldData: any) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            messages: oldData.messages.map(msg =>
              msg.id === data.messageId ? { ...msg, isRead: true } : msg
            )
          };
        });
        
        // Update React Query cache for chama messages
        if (currentChamaId) {
          queryClient.setQueryData(['/api/messages/chama', currentChamaId], (oldData: any) => {
            if (!oldData) return oldData;
            return {
              ...oldData,
              messages: oldData.messages.map(msg =>
                msg.id === data.messageId ? { ...msg, isRead: true } : msg
              )
            };
          });
        }
      }
    });
    
    return () => {
      unregisterDirectMessage();
      unregisterChamaMessage();
      unregisterMessageRead();
    };
  }, [isConnected, isAuthenticated, registerHandler, currentChamaId, queryClient]);
  
  // Join chama chat
  const joinChamaChat = (chamaId: number) => {
    setCurrentChamaId(chamaId);
    if (isConnected && isAuthenticated) {
      wsJoinChamaChat(chamaId);
    }
  };
  
  // Send direct message
  const sendDirectMessage = (receiverId: number, content: string) => {
    if (!user) return false;

    // Create temporary message
    const tempMessage: Message = {
      id: Date.now(), // Temporary ID
      senderId: user.id,
      receiverId,
      content,
      isRead: false,
      sentAt: new Date().toISOString(),
      sender: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        profilePic: user.profilePic
      }
    };

    // Add message immediately to UI
    setMessages(prevMessages => [tempMessage, ...prevMessages]);

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
    if (!currentChamaId || !user) {
      setError('No chama selected');
      return false;
    }

    // Create temporary message
    const tempMessage: Message = {
      id: Date.now(), // Temporary ID
      senderId: user.id,
      chamaId: currentChamaId,
      content,
      isRead: false,
      sentAt: new Date().toISOString(),
      sender: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        profilePic: user.profilePic
      }
    };

    // Add message immediately to UI
    setChamaMessages(prevMessages => [tempMessage, ...prevMessages]);
    
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
  
  // Group messages by conversation
  const conversations = React.useMemo(() => {
    const convoMap = new Map();
    
    messages.forEach(msg => {
      if (msg.receiverId && !msg.chamaId) {
        // Direct message
        const key = msg.senderId === user?.id ? msg.receiverId : msg.senderId;
        
        if (!convoMap.has(key)) {
          const otherUser = msg.senderId === user?.id ? msg.receiver : msg.sender;
          const name = otherUser?.fullName || otherUser?.username || `User ${key}`;
          
          convoMap.set(key, {
            id: key,
            name,
            type: 'user',
            lastMessage: msg,
            unreadCount: msg.isRead ? 0 : 1,
            messages: [msg]
          });
        } else {
          const convo = convoMap.get(key);
          convo.messages.push(msg);
          
          if (new Date(msg.sentAt) > new Date(convo.lastMessage.sentAt)) {
            convo.lastMessage = msg;
          }
          
          if (!msg.isRead && msg.senderId !== user?.id) {
            convo.unreadCount += 1;
          }
        }
      } else if (msg.chamaId) {
        // Chama message
        const key = `chama-${msg.chamaId}`;
        
        if (!convoMap.has(key)) {
          // Get chama name from receiver or use default
          const chamaName = msg.receiver?.name || `Chama ${msg.chamaId}`;
          
          convoMap.set(key, {
            id: msg.chamaId,
            name: chamaName,
            type: 'chama',
            icon: 'groups',
            iconBg: msg.receiver?.iconBg || 'primary',
            lastMessage: msg,
            unreadCount: msg.isRead ? 0 : 1,
            messages: [msg],
            isGroupChat: true
          });
        } else {
          const convo = convoMap.get(key);
          convo.messages.push(msg);
          
          if (new Date(msg.sentAt) > new Date(convo.lastMessage.sentAt)) {
            convo.lastMessage = msg;
          }
          
          if (!msg.isRead && msg.senderId !== user?.id) {
            convo.unreadCount += 1;
          }
        }
      }
    });
    
    // Sort conversations by last message time
    return Array.from(convoMap.values())
      .sort((a, b) => new Date(b.lastMessage.sentAt).getTime() - new Date(a.lastMessage.sentAt).getTime());
  }, [messages, user?.id]);
  
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
