import React, { useState } from 'react';
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import UserLayout from '@/components/layout/UserLayout';
import MarketplaceItem from '@/components/marketplace/MarketplaceItem';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { MessageCircle } from 'lucide-react';
import { useChat } from '@/context/ChatContext';
import { useAuth } from '@/context/AuthContext';

interface ProductDetailPageProps {
  id: string;
}

interface MarketplaceItemData {
  id: number;
  title: string;
  description?: string;
  price: number;
  currency: string;
  imageUrl?: string;
  seller: {
    id: number;
    username: string;
    fullName: string;
    profilePic?: string;
  };
}

interface ApiResponse {
  item: MarketplaceItemData;
}

const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ id }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { sendDirectMessage } = useChat();
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);
  const [messageContent, setMessageContent] = useState('');

  // Fetch product details with proper typing
  const { data: response, isLoading, error }: UseQueryResult<ApiResponse, Error> = useQuery({
    queryKey: ['/api/marketplace', id],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/marketplace/${id}`);
      const data = await response.json();
      
      // Ensure we have the correct data structure
      if (!data || !data.item || !data.item.seller) {
        throw new Error('Invalid product data received');
      }
      
      return data;
    }
  });

  // Handle error outside the query
  React.useEffect(() => {
    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to load product details",
      });
    }
  }, [error, toast]);

  const product = response?.item as MarketplaceItemData | undefined;

  const handleSendMessage = () => {
    if (!product || !user || !messageContent.trim()) return;

    // Don't allow messaging your own product
    if (product.seller.id === user.id) {
      toast({
        variant: "destructive",
        title: "Cannot message yourself",
        description: "You cannot send messages about your own product",
      });
      return;
    }

    // Add product context to the message
    const messageWithContext = `[Re: ${product.title}]\n\n${messageContent}`;
    
    // Send the message
    const success = sendDirectMessage(product.seller.id, messageWithContext);
    
    if (success) {
      toast({
        title: "Message sent",
        description: "Your message has been sent to the seller",
      });
      setMessageContent('');
      setIsMessageDialogOpen(false);
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send message. Please try again.",
      });
    }
  };

  return (
    <UserLayout title={product?.title || 'Product Details'}>
      <div className="max-w-4xl mx-auto p-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : product && product.seller ? (
          <div>
            <MarketplaceItem item={product} showBackButton={true} />
            {user && user.id !== product.seller.id && (
              <div className="mt-4">
                <Button
                  variant="outline"
                  className="w-full flex items-center justify-center gap-2"
                  onClick={() => setIsMessageDialogOpen(true)}
                >
                  <MessageCircle className="h-4 w-4" />
                  Message Seller
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Product not found</p>
          </div>
        )}
      </div>

      <Dialog open={isMessageDialogOpen} onOpenChange={setIsMessageDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Message Seller</DialogTitle>
            <DialogDescription>
              Send a message to {product?.seller.fullName || product?.seller.username} about {product?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Type your message here..."
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsMessageDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSendMessage}
              disabled={!messageContent.trim()}
            >
              Send Message
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </UserLayout>
  );
};

export default ProductDetailPage; 