import React, { useState } from 'react';
import { useMediaQuery } from '@/hooks/use-mobile';
import UserLayout from '@/components/layout/UserLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useQuery } from '@tanstack/react-query';
import MarketplaceItem from '@/components/marketplace/MarketplaceItem';
import { Plus, Search, ShoppingCart, Heart } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link } from 'wouter';
import { Badge } from "@/components/ui/badge";
import { useAuth } from '@/context/AuthContext';

// Create Item Schema
const createItemSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  description: z.string().optional(),
  price: z.coerce.number().positive({ message: "Price must be greater than 0" }),
  imageUrl: z.string().optional(),
  category: z.string().optional(),
  chamaId: z.coerce.number().optional(),
});

interface CartData {
  items: Array<{
    id: number;
    title: string;
    price: number;
    quantity: number;
  }>;
}

interface WishlistData {
  items: Array<{
    id: number;
    title: string;
  }>;
}

interface MarketplaceItem {
  id: number;
  title: string;
  description?: string;
  price: number;
  currency: string;
  imageUrl?: string;
  category: string;
  seller: {
    id: number;
    username: string;
    fullName: string;
    profilePic?: string;
  };
}

interface MarketplaceData {
  items: MarketplaceItem[];
}

const MarketplacePage: React.FC = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Handle API error properly
  const handleError = (error: unknown) => {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    toast({
      variant: "destructive",
      title: "Error",
      description: errorMessage,
    });
  };
  
  // Fetch marketplace items with proper typing
  const { data: marketplaceData, isLoading, error: marketplaceError } = useQuery<MarketplaceData>({
    queryKey: ['/api/marketplace'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/marketplace');
      return response.json();
    },
  });
  
  const items = marketplaceData?.items || [];
  
  if (marketplaceError) {
    handleError(marketplaceError);
  }
  
  // Create item form
  const createItemForm = useForm<z.infer<typeof createItemSchema>>({
    resolver: zodResolver(createItemSchema),
    defaultValues: {
      title: "",
      description: "",
      price: 0,
      imageUrl: "",
      category: "",
      chamaId: undefined,
    },
  });
  
  // Handle create item submit
  const onCreateItemSubmit = async (values: z.infer<typeof createItemSchema>) => {
    try {
      await apiRequest('POST', '/api/marketplace', values);
      
      toast({
        title: "Item created successfully",
        description: "Your listing has been added to the marketplace.",
      });
      
      // Invalidate and refetch queries
      queryClient.invalidateQueries({ queryKey: ['/api/marketplace'] });
      
      setIsAddItemOpen(false);
      createItemForm.reset();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to create item",
        description: error instanceof Error ? error.message : "An error occurred while creating the item.",
      });
    }
  };
  
  // Fetch cart count with proper typing
  const { data: cartData } = useQuery<CartData>({
    queryKey: ['/api/cart'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/cart');
      return response.json();
    },
  });

  // Fetch wishlist count with proper typing
  const { data: wishlistData } = useQuery<WishlistData>({
    queryKey: ['/api/wishlist'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/wishlist');
      return response.json();
    },
  });

  const cartCount = cartData?.items?.length || 0;
  const wishlistCount = wishlistData?.items?.length || 0;
  
  // Filter items with proper typing
  const filteredItems = (items: MarketplaceItem[], category?: string, isMyListing: boolean = false) => {
    return items.filter(item => {
      const matchesSearch = 
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.seller.fullName && item.seller.fullName.toLowerCase().includes(searchTerm.toLowerCase()));

      if (isMyListing) {
        return matchesSearch && item.seller.id === user?.id;
      }

      if (category === 'products') {
        return matchesSearch && item.category && !['services'].includes(item.category.toLowerCase());
      }

      if (category === 'services') {
        return matchesSearch && item.category && item.category.toLowerCase() === 'services';
      }

      return matchesSearch;
    });
  };

  const getCategoryLabel = (category: string | undefined) => {
    if (!category) return 'Other';
    const categoryMap: Record<string, string> = {
      'agriculture': 'Agriculture',
      'crafts': 'Crafts & Handmade',
      'food': 'Food & Beverages',
      'services': 'Services',
      'clothing': 'Clothing & Accessories',
      'other': 'Other'
    };
    return categoryMap[category.toLowerCase()] || category;
  };

  const sortedItems = (items: MarketplaceItem[]) => {
    return [...items].sort((a, b) => a.title.localeCompare(b.title));
  };

  const renderItemGrid = (items: MarketplaceItem[]) => {
    if (items.length === 0) {
      return (
        <div className="bg-neutral-50 dark:bg-neutral-900 rounded-lg py-12 text-center">
          <p className="text-neutral-500 dark:text-neutral-400 text-lg">
            {searchTerm 
              ? "No items match your search criteria." 
              : "No items available in this category."}
          </p>
          {items.length === 0 && user && (
            <Button size="lg" className="mt-6" onClick={() => setIsAddItemOpen(true)}>
              <Plus className="h-5 w-5 mr-2" /> List New Item
            </Button>
          )}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {items.map((item) => (
          <MarketplaceItem 
            key={item.id} 
            item={item}
          />
        ))}
      </div>
    );
  };
  
  const content = (
    <div className="p-4 md:p-6">
      {/* Header with search and buttons */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0 md:space-x-4 mb-6">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500 h-4 w-4" />
          <Input
            placeholder="Search marketplace..."
            className="pl-10 h-11"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex flex-row items-center justify-between md:justify-end gap-3 w-full md:w-auto">
          <Button variant="outline" size="lg" asChild className="flex-1 md:flex-none h-11">
            <Link to="/marketplace/wishlist" className="flex items-center justify-center gap-2">
              <Heart className="h-5 w-5" />
              <span className="hidden sm:inline">Wishlist</span>
              {wishlistCount > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {wishlistCount}
                </Badge>
              )}
            </Link>
          </Button>

          <Button variant="outline" size="lg" asChild className="flex-1 md:flex-none h-11">
            <Link to="/marketplace/cart" className="flex items-center justify-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              <span className="hidden sm:inline">Cart</span>
              {cartCount > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {cartCount}
                </Badge>
              )}
            </Link>
          </Button>

          <Button size="lg" onClick={() => setIsAddItemOpen(true)} className="flex-1 md:flex-none h-11">
            <Plus className="h-5 w-5 md:mr-2" />
            <span className="hidden md:inline">List New Item</span>
          </Button>
        </div>
      </div>
      
      {/* Marketplace tabs and items */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-semibold">Marketplace Items</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 gap-1 mb-6">
              <TabsTrigger value="all" className="py-2.5">All</TabsTrigger>
              <TabsTrigger value="products" className="py-2.5">Products</TabsTrigger>
              <TabsTrigger value="services" className="py-2.5">Services</TabsTrigger>
              <TabsTrigger value="my-listings" className="py-2.5">My Listings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all">
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <div key={n} className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm overflow-hidden h-64 skeleton"></div>
                  ))}
                </div>
              ) : (
                renderItemGrid(sortedItems(filteredItems(items)))
              )}
            </TabsContent>
            
            <TabsContent value="products">
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm overflow-hidden h-64 skeleton"></div>
                  ))}
                </div>
              ) : (
                renderItemGrid(sortedItems(filteredItems(items, 'products')))
              )}
            </TabsContent>
            
            <TabsContent value="services">
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm overflow-hidden h-64 skeleton"></div>
                  ))}
                </div>
              ) : (
                renderItemGrid(sortedItems(filteredItems(items, 'services')))
              )}
            </TabsContent>
            
            <TabsContent value="my-listings">
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm overflow-hidden h-64 skeleton"></div>
                  ))}
                </div>
              ) : (
                renderItemGrid(sortedItems(filteredItems(items, undefined, true)))
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Create Item Dialog */}
      <Dialog open={isAddItemOpen} onOpenChange={setIsAddItemOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl">List Item for Sale</DialogTitle>
            <DialogDescription className="text-neutral-500">
              Add an item or service to the marketplace.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...createItemForm}>
            <form onSubmit={createItemForm.handleSubmit(onCreateItemSubmit)} className="space-y-5">
              <FormField
                control={createItemForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Fresh Organic Vegetables" className="h-11" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={createItemForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">Description (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Fresh harvest from my farm" className="h-11" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <FormField
                  control={createItemForm.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">Price (KES)</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" step="any" className="h-11" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={createItemForm.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">Category (Optional)</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="agriculture">Agriculture</SelectItem>
                          <SelectItem value="crafts">Crafts & Handmade</SelectItem>
                          <SelectItem value="food">Food & Beverages</SelectItem>
                          <SelectItem value="services">Services</SelectItem>
                          <SelectItem value="clothing">Clothing & Accessories</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={createItemForm.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">Image URL (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/image.jpg" className="h-11" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={createItemForm.control}
                name="chamaId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">Chama ID (Optional)</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" placeholder="Associate with a chama" className="h-11" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="submit" size="lg" disabled={createItemForm.formState.isSubmitting} className="w-full sm:w-auto">
                  {createItemForm.formState.isSubmitting ? "Creating..." : "List Item"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );

  return (
    <UserLayout title="Marketplace">
      <div className="max-w-7xl mx-auto">
        {content}
      </div>
    </UserLayout>
  );
};

export default MarketplacePage;
