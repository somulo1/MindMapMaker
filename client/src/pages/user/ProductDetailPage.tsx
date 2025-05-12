import React, { useState } from 'react';
import { useRoute } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import Avatar from '@/components/common/Avatar';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Heart, MessageCircle, ShoppingCart } from 'lucide-react';

const ProductDetailPage: React.FC = () => {
  const [match, params] = useRoute('/marketplace/:id');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const productId = params?.id;
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [showMessageModal, setShowMessageModal] = useState(false);

  console.log('Rendering ProductDetailPage with ID:', productId);

  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/marketplace', productId],
    queryFn: async () => {
      if (!productId) {
        throw new Error('Product ID is required');
      }

      try {
        console.log('Making API request for product:', productId);
        const response = await apiRequest('GET', `/api/marketplace/${productId}`);
        console.log('API Response:', response);
        
        if (!response || !response.ok) {
          throw new Error('Failed to fetch product data');
        }

        const responseData = await response.json();
        console.log('Parsed response data:', responseData);

        if (!responseData || !responseData.item) {
          throw new Error('Product not found');
        }

        return responseData.item;
      } catch (err) {
        console.error('Error in queryFn:', err);
        throw err;
      }
    },
    enabled: !!productId,
    retry: 1,
    retryDelay: 1000,
  });

  // Check if item is in wishlist
  const { data: wishlistData } = useQuery({
    queryKey: ['/api/wishlist'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/wishlist');
      return response.json();
    },
  });

  const isInWishlist = wishlistData?.items?.some((item: any) => item.id === parseInt(productId || '0'));

  // Add to wishlist mutation
  const addToWishlistMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('POST', `/api/wishlist/${productId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/wishlist'] });
      toast({
        title: "Added to wishlist",
        description: "The item has been added to your wishlist.",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to add item to wishlist",
      });
    },
  });

  // Remove from wishlist mutation
  const removeFromWishlistMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('DELETE', `/api/wishlist/${productId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/wishlist'] });
      toast({
        title: "Removed from wishlist",
        description: "The item has been removed from your wishlist.",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to remove item from wishlist",
      });
    },
  });

  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('POST', `/api/cart`, {
        itemId: parseInt(productId || '0'),
        quantity,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      toast({
        title: "Added to cart",
        description: "The item has been added to your cart.",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to add item to cart",
      });
    },
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async () => {
      if (!data?.seller?.id) {
        throw new Error('Seller information not available');
      }
      if (!message.trim()) {
        throw new Error('Message cannot be empty');
      }
      if (!productId) {
        throw new Error('Product ID is required');
      }
      const response = await apiRequest('POST', `/api/messages`, {
        receiverId: data.seller.id,
        content: message,
        itemId: parseInt(productId)
      });
      return response;
    },
    onSuccess: () => {
      setMessage('');
      setIsContactDialogOpen(false);
      toast({
        title: "Message sent",
        description: "Your message has been sent to the seller.",
      });
    },
    onError: (error: any) => {
      console.error('Error sending message:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to send message. Please try again.",
      });
    }
  });

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a message",
      });
      return;
    }
    sendMessageMutation.mutate();
  };

  console.log('Query state:', { data, isLoading, error });

  const product = data;

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="animate-pulse">
          <div className="h-64 bg-neutral-200 dark:bg-neutral-800 rounded-lg mb-4"></div>
          <div className="h-8 bg-neutral-200 dark:bg-neutral-800 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-1/2 mb-4"></div>
        </div>
      </div>
    );
  }

  if (error) {
    console.error('Error rendering product:', error);
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-red-500">Error loading product details: {error.message}</p>
            <p className="text-sm text-neutral-500 mt-2">Please try again later or contact support if the problem persists.</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardContent className="p-6">
            <p>Product not found.</p>
            <p className="text-sm text-neutral-500 mt-2">The product you're looking for doesn't exist or has been removed.</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => window.history.back()}
            >
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const sellerInitials = product.seller?.fullName
    ? product.seller.fullName.split(' ').map(n => n[0]).join('').toUpperCase()
    : product.seller?.username?.substring(0, 2).toUpperCase() || '??';

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <div className="flex items-center mb-4">
            <Avatar
              src={product.seller?.profilePic}
              fallback={sellerInitials}
              size="md"
              className="mr-3"
            />
            <div>
              <h2 className="text-lg font-semibold">{product.seller?.fullName || product.seller?.username || 'Unknown Seller'}</h2>
              <p className="text-sm text-neutral-500">Seller</p>
            </div>
          </div>
          <CardTitle className="text-2xl">{product.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <img
                src={product.imageUrl || 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=300&q=80'}
                alt={product.title}
                className="w-full h-64 object-cover rounded-lg"
              />
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-primary mb-2">
                  {formatCurrency(product.price, product.currency || 'KES')}
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400">
                  {product.description || 'No description provided.'}
                </p>
                <p className="text-sm text-neutral-500 mt-2">
                  Quantity available: {product.quantity}
                </p>
                {product.location && (
                  <p className="text-sm text-neutral-500">
                    Location: {product.location}
                  </p>
                )}
                {product.condition && (
                  <p className="text-sm text-neutral-500">
                    Condition: {product.condition}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="1"
                    max={product.quantity}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.min(parseInt(e.target.value) || 1, product.quantity))}
                    className="w-20"
                  />
                  <Button 
                    className="flex-1"
                    onClick={() => addToCartMutation.mutate()}
                    disabled={addToCartMutation.isPending}
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Add to Cart
                  </Button>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setIsContactDialogOpen(true)}
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Contact Seller
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => isInWishlist ? removeFromWishlistMutation.mutate() : addToWishlistMutation.mutate()}
                  disabled={addToWishlistMutation.isPending || removeFromWishlistMutation.isPending}
                >
                  <Heart className={`mr-2 h-4 w-4 ${isInWishlist ? 'fill-current text-red-500' : ''}`} />
                  {isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isContactDialogOpen} onOpenChange={setIsContactDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Contact Seller</DialogTitle>
            <DialogDescription>
              Send a message to {product.seller?.fullName || product.seller?.username || 'the seller'} about this item.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter your message here..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsContactDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendMessage}
              disabled={!message.trim() || sendMessageMutation.isPending}
            >
              Send Message
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductDetailPage; 