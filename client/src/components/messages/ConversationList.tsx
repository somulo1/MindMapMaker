import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Plus, Users, User } from 'lucide-react';
import Avatar from '../common/Avatar';
import { formatDistanceToNow } from 'date-fns';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

interface Conversation {
  id: number;
  name: string;
  type: 'user' | 'chama';
  lastMessage: {
    content: string;
    sentAt: string;
  };
  unreadCount: number;
}

interface ConversationListProps {
  conversations: Conversation[];
  onSelectConversation: (id: number, type: 'user' | 'chama', name: string) => void;
  selectedId: number | null;
}

// New conversation schema
const newConversationSchema = z.object({
  recipientId: z.coerce.number().positive({ message: "Recipient ID is required" }),
  initialMessage: z.string().min(1, { message: "Message is required" }),
});

const ConversationList: React.FC<ConversationListProps> = ({ 
  conversations, 
  onSelectConversation,
  selectedId
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewConversationOpen, setIsNewConversationOpen] = useState(false);
  const { toast } = useToast();
  
  const newConversationForm = useForm<z.infer<typeof newConversationSchema>>({
    resolver: zodResolver(newConversationSchema),
    defaultValues: {
      recipientId: 0,
      initialMessage: "",
    },
  });
  
  // Filter conversations based on search term
  const filteredConversations = conversations.filter(conversation =>
    conversation.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Handle new conversation submit
  const onNewConversationSubmit = async (values: z.infer<typeof newConversationSchema>) => {
    try {
      // In a real implementation, this would create a new conversation
      // and send the initial message
      
      toast({
        title: "Message sent",
        description: "Your conversation has been started.",
      });
      
      setIsNewConversationOpen(false);
      newConversationForm.reset();
      
      // Simulate selecting the new conversation
      onSelectConversation(values.recipientId, 'user', `User ${values.recipientId}`);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to start conversation",
        description: error.message || "An error occurred while starting the conversation.",
      });
    }
  };
  
  const formatMessageDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return 'Unknown time';
    }
  };
  
  return (
    <>
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-700 flex justify-between items-center">
          <h2 className="text-lg font-semibold">Messages</h2>
          <Button 
            size="sm" 
            variant="ghost" 
            className="h-8 w-8 p-0"
            onClick={() => setIsNewConversationOpen(true)}
          >
            <Plus className="h-5 w-5" />
          </Button>
        </div>
        
        {/* Search */}
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500 h-4 w-4" />
            <Input
              placeholder="Search conversations..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="flex items-center justify-center h-full p-4">
              <div className="text-center">
                <p className="text-neutral-500 dark:text-neutral-400">
                  {searchTerm 
                    ? "No conversations match your search." 
                    : "No conversations yet."}
                </p>
                <Button 
                  variant="outline" 
                  className="mt-2"
                  onClick={() => setIsNewConversationOpen(true)}
                >
                  Start a Conversation
                </Button>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-neutral-200 dark:divide-neutral-700">
              {filteredConversations.map((conversation) => (
                <div 
                  key={`${conversation.type}-${conversation.id}`}
                  className={`p-4 flex items-center cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800 ${
                    selectedId === conversation.id ? 'bg-neutral-100 dark:bg-neutral-800' : ''
                  }`}
                  onClick={() => onSelectConversation(conversation.id, conversation.type, conversation.name)}
                >
                  <div className="relative">
                    <Avatar
                      src={null}
                      fallback={conversation.name.substring(0, 2).toUpperCase()}
                      size="md"
                      className={conversation.type === 'chama' ? 'bg-primary' : ''}
                    />
                    
                    {conversation.unreadCount > 0 && (
                      <Badge className="absolute -top-1 -right-1 px-1.5 py-0.5 min-w-[20px] h-5 flex items-center justify-center">
                        {conversation.unreadCount}
                      </Badge>
                    )}
                    
                    <div className="absolute -bottom-1 -right-1 bg-white dark:bg-neutral-900 rounded-full p-0.5">
                      {conversation.type === 'chama' ? (
                        <Users className="h-3 w-3 text-primary" />
                      ) : (
                        <User className="h-3 w-3 text-neutral-500" />
                      )}
                    </div>
                  </div>
                  
                  <div className="ml-3 flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium truncate">{conversation.name}</h3>
                      <span className="text-xs text-neutral-500 dark:text-neutral-400 whitespace-nowrap ml-2">
                        {formatMessageDate(conversation.lastMessage.sentAt)}
                      </span>
                    </div>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 truncate">
                      {conversation.lastMessage.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* New Conversation Dialog */}
      <Dialog open={isNewConversationOpen} onOpenChange={setIsNewConversationOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Conversation</DialogTitle>
            <DialogDescription>
              Start a conversation with another user.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...newConversationForm}>
            <form onSubmit={newConversationForm.handleSubmit(onNewConversationSubmit)} className="space-y-4">
              <FormField
                control={newConversationForm.control}
                name="recipientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recipient ID</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={newConversationForm.control}
                name="initialMessage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message</FormLabel>
                    <FormControl>
                      <Input placeholder="Type your message..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="submit" disabled={newConversationForm.formState.isSubmitting}>
                  {newConversationForm.formState.isSubmitting ? "Sending..." : "Send Message"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ConversationList;
