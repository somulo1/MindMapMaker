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
  
  // Debug logs for message analysis
  useEffect(() => {
    // console.log('=== Message Analysis ===');
    // console.log('Current User:', {
    //   id: user?.id,
    //   name: user?.username || user?.fullName
    // });
    // console.log('Chat Partner:', {
    //   id: receiverId,
    //   name: recipientName
    // });
    // console.log('All Messages:', messages.map(msg => ({
    //   id: msg.id,
    //   content: msg.content,
    //   sender: {
    //     id: msg.senderId,
    //     name: msg.sender?.username || msg.sender?.fullName
    //   },
    //   receiver: {
    //     id: msg.receiverId,
    //     name: msg.receiver?.username || msg.receiver?.fullName
    //   },
    //   sentAt: msg.sentAt
    // })));
  }, [messages, user, receiverId, recipientName]);
  
  // Filter messages for this conversation
  const filteredMessages = isChama
    ? chamaMessages
    : messages.filter(msg => {
        // Only show messages between current user and the selected receiver
        const isInThisConversation = 
          (msg.senderId === user?.id && msg.receiverId === receiverId) || 
          (msg.receiverId === user?.id && msg.senderId === receiverId);
        
          //  used to show chart logs. 
          
        // console.log('Message Filter:', {
        //   messageId: msg.id,
        //   content: msg.content,
        //   senderId: msg.senderId,
        //   receiverId: msg.receiverId,
        //   currentUserId: user?.id,
        //   targetReceiverId: receiverId,
        //   isInThisConversation
        // });
        
        return isInThisConversation;
      });
  
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
    
    // console.log('Sending message:', {
    //   content: inputValue,
    //   to: isChama ? `Chama ${chamaId}` : `User ${receiverId}`,
    //   isChama
    // });
    
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
  
  const getSenderDisplayName = (message: any) => {
    if (message.senderId === user?.id) return 'ME';
    if (!message.sender) return `User ${message.senderId}`;
    return 'type' in message.sender ? message.sender.name : 
           'username' in message.sender ? message.sender.username :
           'fullName' in message.sender ? message.sender.fullName :
           `User ${message.senderId}`;
  };
  
  const getSenderInitials = (message: any) => {
    if (!message.sender) return 'U';
    const name = 'type' in message.sender ? message.sender.name :
                 'username' in message.sender ? message.sender.username :
                 'fullName' in message.sender ? message.sender.fullName :
                 'U';
    return name.substring(0, 2).toUpperCase();
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
              const senderName = getSenderDisplayName(message);
              const showSenderInfo = isChama || 
                (index > 0 && sortedMessages[index - 1].senderId !== message.senderId);
              
              // console.log('Rendering message:', {
              //   messageId: message.id,
              //   content: message.content,
              //   from: senderName,
              //   to: isCurrentUser ? recipientName : 'You',
              //   sentAt: message.sentAt
              // });

              return (
                <div 
                  key={message.id} 
                  className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-4`}
                >
                  <div className={`max-w-[75%] ${isCurrentUser ? 'mr-2' : 'ml-2'}`}>
                    {/* Sender info */}
                    {showSenderInfo && (
                      <div className={`mb-1 ${isCurrentUser ? 'text-right' : 'text-left'}`}>
                        <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                          {senderName}s
                        </span>
                      </div>
                    )}
                    
                    <div className={`flex items-start ${isCurrentUser ? 'flex-row' : 'flex-row-reverse'}`}>
                      <Avatar
                        src={message.sender?.profilePic}
                        fallback={getSenderInitials(message)}
                        size="sm"
                        className={`${isCurrentUser ? 'ml-2' : 'mr-2'} mt-1`}
                      />
                      
                      <div className={`rounded-lg p-3 ${
                        isCurrentUser 
                          ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100 rounded-tr-none' 
                          : 'bg-green-100 dark:bg-green-900 text-green-900 dark:text-green-100 rounded-tl-none'
                      }`}>
                        <p className="whitespace-pre-wrap break-words">{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          isCurrentUser 
                            ? 'text-blue-600 dark:text-blue-300' 
                            : 'text-green-600 dark:text-green-300'
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
