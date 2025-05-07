import { useEffect, useRef, useState, useCallback } from 'react';

type MessageHandler = (data: any) => void;

interface UseWebSocketProps {
  userId: number | null;
}

export function useWebSocket({ userId }: UseWebSocketProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const messageHandlersRef = useRef<Map<string, Set<MessageHandler>>>(new Map());
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize WebSocket connection
  const connect = useCallback(() => {
    if (!userId) return;

    try {
      // Close existing connection if any
      if (socketRef.current && socketRef.current.readyState < WebSocket.CLOSED) {
        socketRef.current.close();
      }

      // Create new WebSocket connection
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;

      socket.onopen = () => {
        setIsConnected(true);
        setError(null);
        
        // Send authentication message
        socket.send(JSON.stringify({
          type: 'auth',
          userId
        }));
      };

      socket.onclose = (event) => {
        setIsConnected(false);
        setIsAuthenticated(false);
        
        // Attempt to reconnect after delay
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
        
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 3000); // Reconnect after 3 seconds
      };

      socket.onerror = (error) => {
        setError('WebSocket connection error');
        console.error('WebSocket error:', error);
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // Handle authentication success
          if (data.type === 'auth_success') {
            setIsAuthenticated(true);
          }
          
          // Handle auth error
          if (data.type === 'error' && data.message.includes('Authentication failed')) {
            setIsAuthenticated(false);
          }
          
          // Dispatch message to registered handlers
          const handlers = messageHandlersRef.current.get(data.type);
          if (handlers) {
            handlers.forEach(handler => handler(data));
          }
          
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
    } catch (error) {
      setError('Failed to create WebSocket connection');
      console.error('WebSocket connection error:', error);
    }
  }, [userId]);

  // Register a message handler
  const registerHandler = useCallback((type: string, handler: MessageHandler) => {
    if (!messageHandlersRef.current.has(type)) {
      messageHandlersRef.current.set(type, new Set());
    }
    
    messageHandlersRef.current.get(type)!.add(handler);
    
    // Return a function to unregister the handler
    return () => {
      const handlers = messageHandlersRef.current.get(type);
      if (handlers) {
        handlers.delete(handler);
        if (handlers.size === 0) {
          messageHandlersRef.current.delete(type);
        }
      }
    };
  }, []);

  // Send a message
  const sendMessage = useCallback((type: string, data: any) => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN || !isAuthenticated) {
      setError('Cannot send message: WebSocket not connected or authenticated');
      return false;
    }
    
    try {
      socketRef.current.send(JSON.stringify({
        type,
        ...data
      }));
      return true;
    } catch (error) {
      setError('Failed to send message');
      console.error('Send message error:', error);
      return false;
    }
  }, [isAuthenticated]);

  // Join a chama chat
  const joinChamaChat = useCallback((chamaId: number) => {
    return sendMessage('join_chama', { chamaId });
  }, [sendMessage]);

  // Send a direct message
  const sendDirectMessage = useCallback((receiverId: number, content: string) => {
    return sendMessage('direct_message', { receiverId, content });
  }, [sendMessage]);

  // Send a chama message
  const sendChamaMessage = useCallback((chamaId: number, content: string) => {
    return sendMessage('chama_message', { chamaId, content });
  }, [sendMessage]);

  // Mark a message as read
  const markMessageAsRead = useCallback((messageId: number) => {
    return sendMessage('mark_read', { messageId });
  }, [sendMessage]);

  // Connect/disconnect on userId changes
  useEffect(() => {
    if (userId) {
      connect();
    } else {
      // Close connection if userId is null
      if (socketRef.current && socketRef.current.readyState < WebSocket.CLOSED) {
        socketRef.current.close();
      }
      
      setIsConnected(false);
      setIsAuthenticated(false);
    }
    
    // Cleanup on unmount
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      
      if (socketRef.current && socketRef.current.readyState < WebSocket.CLOSED) {
        socketRef.current.close();
      }
    };
  }, [userId, connect]);

  return {
    isConnected,
    isAuthenticated,
    error,
    registerHandler,
    sendMessage,
    joinChamaChat,
    sendDirectMessage,
    sendChamaMessage,
    markMessageAsRead
  };
}
