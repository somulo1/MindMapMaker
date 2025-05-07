import { WebSocketServer, WebSocket } from 'ws';
import { IStorage } from '../storage';

interface ChatClient {
  ws: WebSocket;
  userId: number;
}

export function handleChat(wss: WebSocketServer, storage: IStorage) {
  const clients: Map<number, ChatClient> = new Map();
  const chamaClients: Map<number, Set<ChatClient>> = new Map();

  wss.on('connection', (ws: WebSocket) => {
    let userId: number | null = null;
    let currentChamaId: number | null = null;

    // Handle auth message first to identify the client
    ws.on('message', async (message: string) => {
      try {
        const data = JSON.parse(message);

        // Handle authentication
        if (data.type === 'auth') {
          if (!data.userId) {
            ws.send(JSON.stringify({
              type: 'error',
              message: 'Authentication failed: userId is required'
            }));
            return;
          }

          userId = data.userId;
          
          // Check if user exists
          const user = await storage.getUser(userId);
          if (!user) {
            ws.send(JSON.stringify({
              type: 'error',
              message: 'Authentication failed: user not found'
            }));
            return;
          }

          // Register client
          clients.set(userId, { ws, userId });
          
          ws.send(JSON.stringify({
            type: 'auth_success',
            userId
          }));
          
          return;
        }

        // Require authentication for all other message types
        if (!userId) {
          ws.send(JSON.stringify({
            type: 'error',
            message: 'Not authenticated'
          }));
          return;
        }

        // Handle joining a chama chat room
        if (data.type === 'join_chama') {
          const chamaId = data.chamaId;
          
          // Verify chama exists and user is a member
          const chama = await storage.getChama(chamaId);
          if (!chama) {
            ws.send(JSON.stringify({
              type: 'error',
              message: 'Chama not found'
            }));
            return;
          }
          
          const membership = await storage.getChamaMember(chamaId, userId);
          if (!membership) {
            ws.send(JSON.stringify({
              type: 'error',
              message: 'You are not a member of this chama'
            }));
            return;
          }
          
          // Leave previous chama if any
          if (currentChamaId) {
            const chamaMembers = chamaClients.get(currentChamaId);
            if (chamaMembers) {
              chamaMembers.delete(clients.get(userId)!);
              if (chamaMembers.size === 0) {
                chamaClients.delete(currentChamaId);
              }
            }
          }
          
          // Join new chama
          if (!chamaClients.has(chamaId)) {
            chamaClients.set(chamaId, new Set());
          }
          
          chamaClients.get(chamaId)!.add(clients.get(userId)!);
          currentChamaId = chamaId;
          
          ws.send(JSON.stringify({
            type: 'join_chama_success',
            chamaId
          }));
          
          return;
        }

        // Handle direct messages
        if (data.type === 'direct_message') {
          if (!data.receiverId || !data.content) {
            ws.send(JSON.stringify({
              type: 'error',
              message: 'Invalid direct message: receiverId and content required'
            }));
            return;
          }
          
          // Store message in database
          const message = await storage.createMessage({
            senderId: userId,
            receiverId: data.receiverId,
            content: data.content
          });
          
          // Get sender info
          const sender = await storage.getUser(userId);
          
          // Send to recipient if online
          const recipient = clients.get(data.receiverId);
          if (recipient && recipient.ws.readyState === WebSocket.OPEN) {
            recipient.ws.send(JSON.stringify({
              type: 'direct_message',
              message: {
                ...message,
                sender: {
                  id: sender?.id,
                  username: sender?.username,
                  fullName: sender?.fullName,
                  profilePic: sender?.profilePic
                }
              }
            }));
          }
          
          // Send confirmation to sender
          ws.send(JSON.stringify({
            type: 'message_sent',
            messageId: message.id
          }));
          
          return;
        }

        // Handle chama messages
        if (data.type === 'chama_message') {
          if (!data.chamaId || !data.content) {
            ws.send(JSON.stringify({
              type: 'error',
              message: 'Invalid chama message: chamaId and content required'
            }));
            return;
          }
          
          // Verify user is a member of the chama
          const membership = await storage.getChamaMember(data.chamaId, userId);
          if (!membership) {
            ws.send(JSON.stringify({
              type: 'error',
              message: 'You are not a member of this chama'
            }));
            return;
          }
          
          // Store message in database
          const message = await storage.createMessage({
            senderId: userId,
            chamaId: data.chamaId,
            content: data.content
          });
          
          // Get sender info
          const sender = await storage.getUser(userId);
          
          // Broadcast to all chama members
          const chamaMembers = chamaClients.get(data.chamaId);
          if (chamaMembers) {
            const broadcastMessage = JSON.stringify({
              type: 'chama_message',
              message: {
                ...message,
                sender: {
                  id: sender?.id,
                  username: sender?.username,
                  fullName: sender?.fullName,
                  profilePic: sender?.profilePic
                }
              }
            });
            
            chamaMembers.forEach(client => {
              if (client.ws.readyState === WebSocket.OPEN) {
                client.ws.send(broadcastMessage);
              }
            });
          }
          
          // Send confirmation to sender
          ws.send(JSON.stringify({
            type: 'message_sent',
            messageId: message.id
          }));
          
          return;
        }

        // Handle read receipts
        if (data.type === 'mark_read') {
          if (!data.messageId) {
            ws.send(JSON.stringify({
              type: 'error',
              message: 'Invalid mark_read: messageId required'
            }));
            return;
          }
          
          const message = await storage.getMessage(data.messageId);
          if (!message) {
            ws.send(JSON.stringify({
              type: 'error',
              message: 'Message not found'
            }));
            return;
          }
          
          // Only allow marking messages as read if user is the recipient
          if (message.receiverId !== userId && !message.chamaId) {
            ws.send(JSON.stringify({
              type: 'error',
              message: 'Not authorized to mark this message as read'
            }));
            return;
          }
          
          // If it's a chama message, verify user is a member
          if (message.chamaId) {
            const membership = await storage.getChamaMember(message.chamaId, userId);
            if (!membership) {
              ws.send(JSON.stringify({
                type: 'error',
                message: 'You are not a member of this chama'
              }));
              return;
            }
          }
          
          // Update message
          await storage.updateMessage(data.messageId, { isRead: true });
          
          // Notify sender if online
          const sender = clients.get(message.senderId);
          if (sender && sender.ws.readyState === WebSocket.OPEN) {
            sender.ws.send(JSON.stringify({
              type: 'message_read',
              messageId: data.messageId,
              readBy: userId
            }));
          }
          
          return;
        }

      } catch (error) {
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Invalid message format'
        }));
      }
    });

    // Handle disconnection
    ws.on('close', () => {
      if (userId) {
        // Remove from clients list
        clients.delete(userId);
        
        // Remove from any chama rooms
        if (currentChamaId) {
          const chamaMembers = chamaClients.get(currentChamaId);
          if (chamaMembers) {
            chamaMembers.delete(clients.get(userId)!);
            if (chamaMembers.size === 0) {
              chamaClients.delete(currentChamaId);
            }
          }
        }
      }
    });
  });
}
