import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/context/AuthContext';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface Conversation {
  id: number;
  userId: number;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

export function useAIAssistant() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [currentConversationId, setCurrentConversationId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch user's conversations
  const { data: conversationsData, isLoading: isLoadingConversations } = useQuery({
    queryKey: ['/api/ai/conversations'],
    enabled: !!user,
  });
  
  // Fetch current conversation
  const { data: currentConversationData, isLoading: isLoadingCurrentConversation } = useQuery({
    queryKey: ['/api/ai/conversations', currentConversationId],
    enabled: !!user && !!currentConversationId,
  });
  
  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({ message, conversationId }: { message: string; conversationId?: number }) => {
      try {
        const res = await apiRequest('POST', '/api/ai/message', {
          message,
          conversationId
        });
        return await res.json();
      } catch (error) {
        throw new Error(error.message || 'Failed to send message to AI');
      }
    },
    onSuccess: (data) => {
      // If this is a new conversation, update the current conversation ID
      if (!currentConversationId && data.conversationId) {
        setCurrentConversationId(data.conversationId);
      }
      
      // Invalidate and refetch queries
      if (data.conversationId) {
        queryClient.invalidateQueries({ queryKey: ['/api/ai/conversations', data.conversationId] });
      }
      queryClient.invalidateQueries({ queryKey: ['/api/ai/conversations'] });
      
      setError(null);
    },
    onError: (error: Error) => {
      setError(error.message || 'Failed to send message to AI');
    },
  });
  
  // Send a message to the AI assistant
  const sendMessage = async (message: string) => {
    return sendMessageMutation.mutateAsync({
      message,
      conversationId: currentConversationId || undefined
    });
  };
  
  // Start a new conversation
  const startNewConversation = () => {
    setCurrentConversationId(null);
  };
  
  // Select an existing conversation
  const selectConversation = (conversationId: number) => {
    setCurrentConversationId(conversationId);
  };
  
  return {
    conversations: conversationsData?.conversations || [],
    currentConversation: currentConversationData?.conversation || null,
    messages: currentConversationData?.conversation?.messages || [],
    sendMessage,
    startNewConversation,
    selectConversation,
    isLoading: isLoadingConversations || isLoadingCurrentConversation || sendMessageMutation.isPending,
    error
  };
}
