import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import UserLayout from '@/components/layout/UserLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { formatCurrency } from '@/lib/utils';
import { Minus, Plus, ShoppingCart, Trash2, ArrowLeft } from 'lucide-react';
import { useWallet } from '@/hooks/useWallet';
import { Separator } from '@/components/ui/separator';
import Avatar from '@/components/common/Avatar';
import { Link } from 'wouter';

interface CartItem {
  id: number;
  itemId: number;
  quantity: number;
  title: string;
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

interface CartData {
  items: CartItem[];
  total: number;
}

interface CheckoutResponse {
  success: boolean;
  message: string;
  transaction?: {
    id: number;
    amount: number;
    status: string;
  };
}

const MyCartPage: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { wallet } = useWallet();

  // Fetch cart items
  const { data: cartData, isLoading } = useQuery<CartData>({
    queryKey: ['/api/cart'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/cart');
      if (!response.ok) {
        throw new Error('Failed to fetch cart items');
      }
      const data = await response.json();
      
      // Calculate total from items
      const total = data.items.reduce((sum: number, item: CartItem) => 
        sum + (item.price * item.quantity), 0);
      
      return {
        items: data.items || [],
        total
      };
    },
  });

  const cartItems = cartData?.items || [];
  const total = cartData?.total || 0;
  const balance = wallet?.balance || 0;

  // Update quantity mutation
  const updateQuantityMutation = useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: number; quantity: number }) => {
      const response = await apiRequest('PUT', '/api/cart', { 
        itemId, 
        quantity 
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update quantity');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update quantity",
      });
    },
  });

  // Remove from cart mutation
  const removeFromCartMutation = useMutation({
    mutationFn: async (itemId: number) => {
      const response = await apiRequest('DELETE', `/api/cart/${itemId}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to remove item');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      toast({
        title: "Item removed",
        description: "Item has been removed from your cart",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to remove item from cart",
      });
    },
  });

  // Checkout mutation
  const checkoutMutation = useMutation({
    mutationFn: async () => {
      // First check if user has sufficient balance
      if (total > balance) {
        throw new Error('Insufficient balance in your wallet');
      }

      // Validate cart items
      if (!cartItems.length) {
        throw new Error('Your cart is empty');
      }

      const response = await apiRequest('POST', '/api/cart/checkout', {
        cartItems: cartItems.map(item => ({
          itemId: item.itemId,
          quantity: item.quantity,
          sellerId: item.seller.id
        })),
        totalAmount: total
      });

      let data;
      try {
        data = await response.json();
      } catch (e) {
        throw new Error('Failed to parse server response');
      }

      if (!response.ok) {
        throw new Error(data.message || 'Failed to complete checkout');
      }

      if (!data.success) {
        throw new Error(data.message || 'Transaction failed');
      }

      return data;
    },
    onSuccess: (data) => {
      // Invalidate and refetch relevant queries to update UI
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      queryClient.invalidateQueries({ queryKey: ['/api/wallets/user'] });
      queryClient.invalidateQueries({ queryKey: ['/api/transactions/user'] });
      
      toast({
        title: "Purchase Successful",
        description: "Your order has been placed and sellers have been paid.",
      });
    },
    onError: (error: Error) => {
      console.error('Checkout error:', error);
      
      toast({
        variant: "destructive",
        title: "Checkout Failed",
        description: error.message || "Failed to complete checkout. Please try again.",
        duration: 5000,
      });
    },
  });

  return (
    <UserLayout title="My Cart">
      <div className="max-w-4xl mx-auto p-4">
        <div className="mb-4">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="flex items-center gap-2"
          >
            <Link href="/marketplace">
              <ArrowLeft className="h-4 w-4" />
              Back to Marketplace
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">Shopping Cart</CardTitle>
            <div className="text-sm text-muted-foreground">
              {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : cartItems.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Your cart is empty</p>
                <Button className="mt-4" variant="outline" asChild>
                  <Link href="/marketplace">Continue Shopping</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {cartItems.map((item) => {
                  const itemTotal = (item.price || 0) * (item.quantity || 1);
                  return (
                    <div key={item.id} className="flex items-start gap-4">
                      <img
                        src={item.imageUrl || 'https://via.placeholder.com/100'}
                        alt={item.title}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <div>
                            <h3 className="font-medium">{item.title}</h3>
                            <div className="flex items-center mt-1">
                              <Avatar
                                src={item.seller?.profilePic}
                                fallback={(item.seller?.fullName || 'U')[0]}
                                size="sm"
                                className="mr-2"
                              />
                              <span className="text-sm text-muted-foreground">
                                {item.seller?.fullName || item.seller?.username || 'Unknown Seller'}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">
                              {formatCurrency(itemTotal, item.currency || 'KES')}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {formatCurrency(item.price || 0, item.currency || 'KES')} each
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => {
                                if (item.quantity > 1) {
                                  updateQuantityMutation.mutate({
                                    itemId: item.itemId,
                                    quantity: item.quantity - 1,
                                  });
                                }
                              }}
                              disabled={item.quantity === 1 || updateQuantityMutation.isPending}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-8 text-center">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => {
                                updateQuantityMutation.mutate({
                                  itemId: item.itemId,
                                  quantity: item.quantity + 1,
                                });
                              }}
                              disabled={updateQuantityMutation.isPending}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => removeFromCartMutation.mutate(item.id)}
                            disabled={removeFromCartMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                <Separator className="my-6" />

                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-medium">{formatCurrency(total, 'KES')}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Available Balance</span>
                    <span>{formatCurrency(balance, 'KES')}</span>
                  </div>
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={() => checkoutMutation.mutate()}
                    disabled={checkoutMutation.isPending || total > balance || cartItems.length === 0}
                  >
                    {checkoutMutation.isPending ? "Processing..." : "Checkout"}
                  </Button>
                  {total > balance && (
                    <p className="text-sm text-destructive text-center">
                      Insufficient balance. Please add funds to your wallet.
                    </p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </UserLayout>
  );
};

export default MyCartPage; 