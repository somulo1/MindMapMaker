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
import { ScrollArea } from '@/components/ui/scroll-area';

interface Conversation {
  id: number;
  name: string;
  type: 'user' | 'chama';
  icon?: string;
  iconBg?: string;
  lastMessage: {
    content: string;
    sentAt: string;
    isSystemMessage?: boolean;
  };
  unreadCount: number;
  isGroupChat?: boolean;
}

interface ConversationListProps {
  conversations: Conversation[];
  onSelectConversation: (id: number, type: 'user' | 'chama', name: string) => void;
  selectedId?: number | null;
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
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to start conversation",
        description: error?.message || "An error occurred while starting the conversation.",
      });
    }
  };
  
  const formatMessagePreview = (content: string) => {
    return content.length > 50 ? content.substring(0, 47) + '...' : content;
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
          <ScrollArea className="h-full">
            <div className="p-4 space-y-2">
              {filteredConversations.map((conversation) => (
                <Button
                  key={`${conversation.type}-${conversation.id}`}
                  variant={selectedId === conversation.id ? "secondary" : "ghost"}
                  className="w-full justify-start p-3 h-auto"
                  onClick={() => onSelectConversation(conversation.id, conversation.type, conversation.name)}
                >
                  <div className="flex items-start w-full">
                    {conversation.type === 'chama' ? (
                      <div className={`w-10 h-10 rounded-full bg-${conversation.iconBg || 'primary'} flex items-center justify-center text-white`}>
                        <Users className="h-5 w-5" />
                      </div>
                    ) : (
                      <Avatar
                        src={null}
                        fallback={conversation.name.substring(0, 2).toUpperCase()}
                        size="md"
                      />
                    )}
                    
                    <div className="ml-3 flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center">
                          <p className="font-medium text-sm truncate">
                            {conversation.name}
                          </p>
                          {conversation.type === 'chama' && (
                            <Badge variant="outline" className="ml-2 text-xs">
                              Chama
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                          {formatDistanceToNow(new Date(conversation.lastMessage.sentAt), { addSuffix: true })}
                        </span>
                      </div>
                      
                      <p className="text-sm text-muted-foreground truncate mt-1">
                        {conversation.lastMessage.isSystemMessage ? (
                          <span className="italic">{formatMessagePreview(conversation.lastMessage.content)}</span>
                        ) : (
                          formatMessagePreview(conversation.lastMessage.content)
                        )}
                      </p>
                      
                      {conversation.unreadCount > 0 && (
                        <Badge variant="default" className="mt-1">
                          {conversation.unreadCount} new
                        </Badge>
                      )}
                    </div>
                  </div>
                </Button>
              ))}
              
              {filteredConversations.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No conversations match your search.</p>
                </div>
              )}
            </div>
          </ScrollArea>
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
