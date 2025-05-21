import React, { useState, useEffect } from 'react';
import { useMediaQuery } from '@/hooks/use-mobile';
import UserLayout from '@/components/layout/UserLayout';
import { Card } from '@/components/ui/card';
import ConversationList from '@/components/messages/ConversationList';
import ChatInterface from '@/components/messages/ChatInterface';
import { useChat } from '@/context/ChatContext';
import { useAuth } from '@/context/AuthContext';

const MessagesPage: React.FC = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { messages } = useChat();
  const { user } = useAuth();
  const [selectedReceiverId, setSelectedReceiverId] = useState<number | null>(null);
  const [selectedChamaId, setSelectedChamaId] = useState<number | null>(null);
  const [selectedName, setSelectedName] = useState<string | null>(null);
  
  // Group messages by conversation
  const conversations = React.useMemo(() => {
    const convoMap = new Map();
    
    messages.forEach(msg => {
      if (msg.receiverId && !msg.chamaId) {
        // Direct message
        // Determine the other participant in the conversation
        const otherId = msg.senderId === user?.id ? msg.receiverId : msg.senderId;
        const otherUser = msg.senderId === user?.id ? msg.receiver : msg.sender;
        const otherName = otherUser ? (
          'username' in otherUser ? otherUser.username : 
          'fullName' in otherUser ? otherUser.fullName : 
          'name' in otherUser ? otherUser.name : 
          `User ${otherId}`
        ) : `User ${otherId}`;
          
        const key = `user-${otherId}`;
        
        if (!convoMap.has(key)) {
          // Create new conversation
          convoMap.set(key, {
            id: otherId,
            name: otherName,
            type: 'user',
            lastMessage: msg,
            unreadCount: msg.isRead ? 0 : 1,
            messages: [msg]
          });
        } else {
          // Update existing conversation
          const convo = convoMap.get(key);
          convo.messages.push(msg);
          
          // Update last message if this one is newer
          if (new Date(msg.sentAt) > new Date(convo.lastMessage.sentAt)) {
            convo.lastMessage = msg;
          }
          
          // Update unread count
          if (!msg.isRead && msg.senderId !== user?.id) {
              convo.unreadCount += 1;
          }
        }
      } else if (msg.chamaId) {
        // Chama message
        const key = `chama-${msg.chamaId}`;
        
        if (!convoMap.has(key)) {
          convoMap.set(key, {
            id: msg.chamaId,
            name: msg.receiver?.name || `Chama ${msg.chamaId}`,
            type: 'chama',
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
      }
    });
    
    // Sort conversations by last message time
    return Array.from(convoMap.values())
      .sort((a, b) => new Date(b.lastMessage.sentAt).getTime() - new Date(a.lastMessage.sentAt).getTime());
  }, [messages, user?.id]);
  
  const handleSelectConversation = (id: number, type: 'user' | 'chama', name: string) => {
    if (type === 'user') {
      setSelectedReceiverId(id);
      setSelectedChamaId(null);
    } else {
      setSelectedChamaId(id);
      setSelectedReceiverId(null);
    }
    setSelectedName(name);
  };
  
  return (
    <UserLayout title="Messages">
      <div className={`${isMobile ? 'p-0' : ''} h-full flex flex-col md:flex-row`}>
        {/* Conversation list - hidden in mobile when a chat is selected */}
        <div 
          className={`${isMobile && (selectedReceiverId || selectedChamaId) ? 'hidden' : 'block'} 
                     md:block md:w-1/3 border-r border-neutral-200 dark:border-neutral-700`}
        >
          <div className="h-full">
            <ConversationList 
              conversations={conversations} 
              onSelectConversation={handleSelectConversation}
              selectedId={selectedReceiverId || selectedChamaId}
            />
          </div>
        </div>
        
        {/* Chat interface - fullscreen in mobile when selected */}
        <div 
          className={`${isMobile && !(selectedReceiverId || selectedChamaId) ? 'hidden' : 'block'} 
                     flex-1 h-full`}
        >
          {(selectedReceiverId || selectedChamaId) ? (
            <ChatInterface 
              receiverId={selectedReceiverId} 
              isChama={!!selectedChamaId}
              chamaId={selectedChamaId}
              recipientName={selectedName}
              onBack={isMobile ? () => {
                setSelectedReceiverId(null);
                setSelectedChamaId(null);
              } : undefined}
            />
          ) : (
            <div className="h-full flex items-center justify-center p-6 bg-neutral-50 dark:bg-neutral-900">
              <div className="text-center">
                <div className="rounded-full bg-primary/10 w-20 h-20 flex items-center justify-center mx-auto mb-4">
                  <span className="material-icons text-primary text-3xl">chat</span>
                </div>
                <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
                <p className="text-neutral-500 dark:text-neutral-400 max-w-md">
                  Choose a contact or chama from the list to start messaging
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </UserLayout>
  );
};

export default MessagesPage;
