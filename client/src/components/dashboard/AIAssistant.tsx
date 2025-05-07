import React, { useState, useRef, useEffect } from 'react';
import { useAIAssistant } from '@/hooks/useAIAssistant';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, ToyBrick } from 'lucide-react';
import Avatar from '../common/Avatar';
import { useAuth } from '@/context/AuthContext';

interface MessageItemProps {
  role: 'user' | 'assistant';
  content: string;
  initials: string;
}

const MessageItem: React.FC<MessageItemProps> = ({ role, content, initials }) => {
  const isUser = role === 'user';
  
  return (
    <div className={`flex items-start ${isUser ? 'justify-end mb-3' : 'mb-3'}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center text-xs font-medium mr-2 flex-shrink-0">
          AI
        </div>
      )}
      <div className={`${isUser 
        ? 'bg-primary/10 text-primary-dark dark:text-primary-light' 
        : 'bg-neutral-100 dark:bg-neutral-800'} rounded-lg p-2 text-sm max-w-[85%]`}
      >
        <p>{content}</p>
      </div>
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-medium ml-2 flex-shrink-0">
          {initials}
        </div>
      )}
    </div>
  );
};

const AIAssistant: React.FC = () => {
  const { user } = useAuth();
  const { sendMessage, messages, isLoading } = useAIAssistant();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const userInitials = user?.fullName ? 
    user.fullName.split(' ').map(n => n[0]).join('').toUpperCase() : 
    user?.username?.substring(0, 2).toUpperCase() || 'U';
  
  useEffect(() => {
    // Scroll to bottom whenever messages change
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    try {
      await sendMessage(input);
      setInput('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <Card className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm mb-6">
      <CardContent className="p-5">
        <div className="flex items-start mb-4">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
            <ToyBrick className="text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Financial AI Assistant</h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Ask me anything about personal finance or your accounts
            </p>
          </div>
        </div>
        
        <div className="bg-neutral-50 dark:bg-neutral-900 rounded-lg p-3 mb-4 max-h-48 overflow-y-auto">
          {messages.length === 0 && !isLoading ? (
            <div className="text-center text-neutral-500 dark:text-neutral-400 py-8">
              <ToyBrick className="h-8 w-8 mx-auto mb-2 text-primary/50" />
              <p>Ask me a question about your finances.</p>
            </div>
          ) : isLoading && messages.length === 0 ? (
            <div className="flex items-start mb-3">
              <div className="w-8 h-8 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center text-xs font-medium mr-2 flex-shrink-0">
                AI
              </div>
              <div className="bg-neutral-100 dark:bg-neutral-800 rounded-lg p-2 text-sm max-w-[85%]">
                <div className="h-4 w-32 skeleton rounded mb-2"></div>
                <div className="h-4 w-48 skeleton rounded"></div>
              </div>
            </div>
          ) : (
            messages.map((message, index) => (
              <MessageItem 
                key={index}
                role={message.role}
                content={message.content}
                initials={userInitials}
              />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
        
        <form onSubmit={handleSubmit} className="flex items-center">
          <Input
            type="text"
            placeholder="Ask about your finances..."
            className="flex-1 border border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 rounded-l-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
          />
          <Button 
            type="submit"
            className="bg-primary hover:bg-primary-dark text-white p-2 rounded-r-lg"
            disabled={isLoading || !input.trim()}
          >
            <Send className="h-5 w-5" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AIAssistant;
