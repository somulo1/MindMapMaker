import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronLeft, Send } from 'lucide-react';
import Avatar from '../common/Avatar';
import { useChat } from '@/context/ChatContext';
import { formatDate } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

interface ChatInterfaceProps {
  receiverId?: number | null;
  isChama?: boolean;
  chamaId?: number | null;
  recipientName?: string | null;
  onBack?: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  receiverId,
  isChama = false,
  chamaId,
  recipientName,
  onBack,
}) => {
  const { user } = useAuth();
  const { 
    messages, 
    chamaMessages, 
    sendDirectMessage, 
    sendChamaMessage, 
    markMessageAsRead,
    isConnected 
  } = useChat();
  
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Filter messages based on the selected recipient or chama
  const filteredMessages = isChama
    ? chamaMessages
    : messages.filter(msg => 
        (msg.senderId === user?.id && msg.receiverId === receiverId) || 
        (msg.receiverId === user?.id && msg.senderId === receiverId)
      );
  
  // Sort messages by date
  const sortedMessages = [...filteredMessages].sort(
    (a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()
  );
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [sortedMessages]);
  
  // Mark unread messages as read
  useEffect(() => {
    sortedMessages.forEach(msg => {
      if (!msg.isRead && msg.senderId !== user?.id) {
        markMessageAsRead(msg.id);
      }
    });
  }, [sortedMessages, markMessageAsRead, user?.id]);
  
  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    
    if (isChama && chamaId) {
      sendChamaMessage(inputValue);
    } else if (receiverId) {
      sendDirectMessage(receiverId, inputValue);
    }
    
    setInputValue('');
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const renderMessageDate = (date: string) => {
    return formatDate(date, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };
  
  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="bg-white dark:bg-neutral-800 p-4 flex items-center border-b border-neutral-200 dark:border-neutral-700">
        {onBack && (
          <Button variant="ghost" size="sm" className="mr-2 p-0 h-8 w-8" onClick={onBack}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
        )}
        
        <Avatar
          src={null}
          fallback={recipientName ? recipientName.substring(0, 2).toUpperCase() : 'U'}
          size="md"
          className="mr-3"
        />
        
        <div>
          <h2 className="font-medium">
            {recipientName || (isChama ? `Chama ${chamaId}` : `User ${receiverId}`)}
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            {isConnected ? 'Online' : 'Offline'} • {isChama ? 'Group Chat' : 'Direct Message'}
          </p>
        </div>
      </div>
      
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 bg-neutral-50 dark:bg-neutral-900">
        {sortedMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-neutral-500 dark:text-neutral-400">No messages yet.</p>
              <p className="text-sm text-neutral-400 dark:text-neutral-500 mt-1">
                Start the conversation by sending a message.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedMessages.map((message, index) => {
              const isCurrentUser = message.senderId === user?.id;
              const senderName = isCurrentUser 
                ? 'You' 
                : message.sender?.fullName || message.sender?.username || `User ${message.senderId}`;
              
              return (
                <div 
                  key={message.id} 
                  className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div className="max-w-[75%]">
                    {/* Sender info - only show in group chats or when sender changes */}
                    {(isChama || (index > 0 && sortedMessages[index - 1].senderId !== message.senderId)) && !isCurrentUser && (
                      <div className="ml-10 mb-1">
                        <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                          {senderName}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex items-start">
                      {!isCurrentUser && (
                        <Avatar
                          src={message.sender?.profilePic}
                          fallback={(message.sender?.fullName || message.sender?.username || 'U').substring(0, 2).toUpperCase()}
                          size="sm"
                          className="mr-2 mt-1"
                        />
                      )}
                      
                      <div className={`rounded-lg p-3 ${
                        isCurrentUser 
                          ? 'bg-primary text-primary-foreground rounded-tr-none' 
                          : 'bg-white dark:bg-neutral-800 rounded-tl-none'
                      }`}>
                        <p className="whitespace-pre-wrap">{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          isCurrentUser 
                            ? 'text-primary-foreground/70' 
                            : 'text-neutral-500 dark:text-neutral-400'
                        }`}>
                          {renderMessageDate(message.sentAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      
      {/* Message Input */}
      <div className="p-4 bg-white dark:bg-neutral-800 border-t border-neutral-200 dark:border-neutral-700">
        <div className="flex items-center">
          <Input
            placeholder="Type a message..."
            className="flex-1 mr-2"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <Button 
            size="icon" 
            onClick={handleSendMessage}
            disabled={!inputValue.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
