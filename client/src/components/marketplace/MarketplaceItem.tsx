import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import Avatar from '../common/Avatar';
import { Heart, ShoppingCart, ArrowLeft, MessageCircle } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useChat } from '@/context/ChatContext';
import { useAuth } from '@/context/AuthContext';

interface MarketplaceItemProps {
  item: {
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
    isInWishlist?: boolean;
    isInCart?: boolean;
  };
  showBackButton?: boolean;
}

const MarketplaceItem: React.FC<MarketplaceItemProps> = ({ item, showBackButton = false }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { sendDirectMessage } = useChat();
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);
  const [messageContent, setMessageContent] = useState('');
  
  // Safely access seller information with fallbacks
  const seller = item.seller || {};
  const sellerName = seller.fullName || seller.username || 'Unknown Seller';
  const sellerInitials = sellerName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);

  const formattedPrice = formatCurrency(item.price, item.currency);
  const displayName = `${sellerName.charAt(0).toUpperCase()}${sellerName.slice(1).split(' ')[0]}'s ${item.title.includes('Shop') ? '' : 'Shop'}`;

  // Fallback image URL if not provided
  const imageUrl = item.imageUrl || 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=300&q=80';

  // Toggle wishlist mutation
  const toggleWishlistMutation = useMutation({
    mutationFn: async () => {
      if (item.isInWishlist) {
        await apiRequest('DELETE', `/api/wishlist/${item.id}`);
      } else {
        // Check if item is already in wishlist before adding
        const response = await apiRequest('GET', `/api/wishlist`);
        const data = await response.json();
        const isAlreadyInWishlist = data.items?.some((wishlistItem: any) => wishlistItem.id === item.id);
        
        if (isAlreadyInWishlist) {
          throw new Error('Item is already in your wishlist');
        }
        
        await apiRequest('POST', `/api/wishlist/${item.id}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/wishlist'] });
      queryClient.invalidateQueries({ queryKey: ['/api/marketplace'] });
      toast({
        title: item.isInWishlist ? "Removed from wishlist" : "Added to wishlist",
        description: item.isInWishlist 
          ? "Item has been removed from your wishlist" 
          : "Item has been added to your wishlist",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Wishlist Action Failed",
        description: error.message || "Failed to update wishlist",
      });
    },
  });

  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/cart', {
        itemId: item.id,
        quantity: 1
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to add item to cart');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      toast({
        title: "Added to cart",
        description: "Item has been added to your cart",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to add item to cart",
      });
    },
  });

  // Handle sending message to seller
  const handleSendMessage = () => {
    if (!user || !messageContent.trim()) return;

    // Don't allow messaging your own product
    if (seller.id === user.id) {
      toast({
        variant: "destructive",
        title: "Cannot message yourself",
        description: "You cannot send messages about your own product",
      });
      return;
    }

    // Add product context to the message
    const messageWithContext = `[Re: ${item.title}]\n\n${messageContent}`;
    
    // Send the message
    const success = sendDirectMessage(seller.id, messageWithContext);
    
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
    <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm overflow-hidden">
      {showBackButton && (
        <div className="p-3 border-b">
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-2"
            onClick={() => setLocation('/marketplace')}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Marketplace
          </Button>
        </div>
      )}
      <img src={imageUrl} alt={item.title} className="w-full h-36 object-cover" />
      <div className="p-3">
        <div className="flex items-center mb-2">
          <Avatar 
            src={seller.profilePic}
            fallback={sellerInitials}
            size="sm"
            className="mr-2 bg-secondary text-white text-xs"
          />
          <span className="text-xs text-neutral-500 dark:text-neutral-400">{displayName}</span>
        </div>
        <h3 className="font-medium text-sm mb-1">{item.title}</h3>
        <p className="text-primary font-semibold text-sm mb-3">{formattedPrice}</p>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            className="flex-1 flex items-center gap-2"
            onClick={() => addToCartMutation.mutate()}
            disabled={addToCartMutation.isPending}
          >
            <ShoppingCart className="h-4 w-4" />
            {item.isInCart ? 'In Cart' : 'Add to Cart'}
          </Button>
          <Button
            variant={item.isInWishlist ? "secondary" : "outline"}
            size="icon"
            className={`h-8 w-8 transition-colors ${
              item.isInWishlist ? 'bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30' : ''
            }`}
            onClick={() => toggleWishlistMutation.mutate()}
            disabled={toggleWishlistMutation.isPending}
          >
            <Heart 
              className={`h-4 w-4 transition-colors ${
                item.isInWishlist 
                  ? 'fill-red-500 stroke-red-500' 
                  : 'stroke-current hover:stroke-red-500'
              }`}
            />
          </Button>
          {user && user.id !== seller.id && (
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setIsMessageDialogOpen(true)}
            >
              <MessageCircle className="h-4 w-4" />
            </Button>
          )}
        </div>
        <Button 
          variant="link" 
          className="w-full text-xs mt-2 h-auto py-1"
          asChild
        >
          <Link href={`/marketplace/${item.id}`}>View Details</Link>
        </Button>
      </div>

      <Dialog open={isMessageDialogOpen} onOpenChange={setIsMessageDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Message Seller</DialogTitle>
            <DialogDescription>
              Send a message to {seller.fullName || seller.username} about {item.title}
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
    </div>
  );
};

export default MarketplaceItem;
