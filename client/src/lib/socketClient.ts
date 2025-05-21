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
      if (socketRef.current) {
        socketRef.current.close();
      }

      // Create new WebSocket connection
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//localhost:5000/ws?token=${userId}`;
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        setIsConnected(true);
        setError(null);
        // Send authentication message
        ws.send(JSON.stringify({
          type: 'auth',
          userId
        }));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // Handle authentication success
          if (data.type === 'auth_success') {
            setIsAuthenticated(true);
            return;
          }
          
          // Handle errors
          if (data.type === 'error') {
            setError(data.message);
            return;
          }
          
          // Notify all handlers for this message type
          const handlers = messageHandlersRef.current.get(data.type);
          if (handlers) {
            handlers.forEach(handler => handler(data));
          }
        } catch (err) {
          console.error('Error processing message:', err);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        setIsAuthenticated(false);
        
        // Attempt to reconnect after delay
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
        reconnectTimeoutRef.current = setTimeout(connect, 5000);
      };

      ws.onerror = () => {
        setError('WebSocket connection error');
      };

      socketRef.current = ws;
    } catch (err) {
      console.error('Error setting up WebSocket:', err);
      setError('Failed to establish WebSocket connection');
    }
  }, [userId]);

  // Subscribe to message types
  const subscribe = useCallback((type: string, handler: MessageHandler) => {
    if (!messageHandlersRef.current.has(type)) {
      messageHandlersRef.current.set(type, new Set());
    }
    messageHandlersRef.current.get(type)!.add(handler);
    
    // Return unsubscribe function
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

  // Send message through WebSocket
  const send = useCallback((data: any) => {
    if (socketRef.current && isConnected && isAuthenticated) {
      socketRef.current.send(JSON.stringify(data));
      return true;
    }
    return false;
  }, [isConnected, isAuthenticated]);

  // Chat-specific functions
  const sendDirectMessage = useCallback((receiverId: number, content: string) => {
    return send({
      type: 'direct_message',
      receiverId,
      content
    });
  }, [send]);

  const sendChamaMessage = useCallback((chamaId: number, content: string) => {
    return send({
      type: 'chama_message',
      chamaId,
      content
    });
  }, [send]);

  const joinChamaChat = useCallback((chamaId: number) => {
    return send({
      type: 'join_chama',
      chamaId
    });
  }, [send]);

  const markMessageAsRead = useCallback((messageId: number) => {
    return send({
      type: 'mark_read',
      messageId
    });
  }, [send]);

  // Connect on mount or when userId changes
  useEffect(() => {
    connect();
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connect]);

  return {
    isConnected,
    isAuthenticated,
    error,
    registerHandler: subscribe,
    send,
    sendDirectMessage,
    sendChamaMessage,
    joinChamaChat,
    markMessageAsRead
  };
}
