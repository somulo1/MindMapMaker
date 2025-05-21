import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import UserLayout from '@/components/layout/UserLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { formatCurrency } from '@/lib/utils';
import { Heart, ShoppingCart, Trash2, ArrowLeft } from 'lucide-react';
import Avatar from '@/components/common/Avatar';
import { Link } from 'wouter';

const MyWishlistPage: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch wishlist items
  const { data: wishlistData, isLoading } = useQuery({
    queryKey: ['/api/wishlist'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/wishlist');
      return response.json();
    },
  });

  const wishlistItems = wishlistData?.items || [];

  // Remove from wishlist mutation
  const removeFromWishlistMutation = useMutation({
    mutationFn: async (itemId: number) => {
      await apiRequest('DELETE', `/api/wishlist/${itemId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/wishlist'] });
      toast({
        title: "Item removed",
        description: "Item has been removed from your wishlist",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to remove item from wishlist",
      });
    },
  });

  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: async (itemId: number) => {
      await apiRequest('POST', `/api/cart/${itemId}`, { quantity: 1 });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      toast({
        title: "Added to cart",
        description: "Item has been added to your cart",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add item to cart",
      });
    },
  });

  return (
    <UserLayout title="My Wishlist">
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
            <CardTitle className="text-lg font-semibold">My Wishlist</CardTitle>
            <div className="text-sm text-muted-foreground">
              {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'}
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : wishlistItems.length === 0 ? (
              <div className="text-center py-8">
                <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Your wishlist is empty</p>
                <Button className="mt-4" variant="outline" asChild>
                  <a href="/marketplace">Browse Marketplace</a>
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {wishlistItems.map((item: any) => (
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
                              src={item.seller.profilePic}
                              fallback={item.seller.fullName.charAt(0)}
                              size="sm"
                              className="mr-2"
                            />
                            <span className="text-sm text-muted-foreground">
                              {item.seller.fullName}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">
                            {formatCurrency(item.price, 'KES')}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-end gap-2 mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-2"
                          onClick={() => addToCartMutation.mutate(item.id)}
                        >
                          <ShoppingCart className="h-4 w-4" />
                          Add to Cart
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => removeFromWishlistMutation.mutate(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </UserLayout>
  );
};

export default MyWishlistPage; 