import React, { useState } from 'react';
import { useMediaQuery } from '@/hooks/use-mobile';
import MobileLayout from '@/components/layouts/MobileLayout';
import DesktopLayout from '@/components/layouts/DesktopLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useQuery } from '@tanstack/react-query';
import MarketplaceItem from '@/components/marketplace/MarketplaceItem';
import { Plus, Search } from 'lucide-react';
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

// Create Item Schema
const createItemSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  description: z.string().optional(),
  price: z.coerce.number().positive({ message: "Price must be greater than 0" }),
  imageUrl: z.string().optional(),
  category: z.string().optional(),
  chamaId: z.coerce.number().optional(),
});

const MarketplacePage: React.FC = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const { data: marketplaceData, isLoading } = useQuery({
    queryKey: ['/api/marketplace'],
  });
  
  const items = marketplaceData?.items || [];
  
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
        description: error.message || "An error occurred while creating the item.",
      });
    }
  };
  
  // Filter items based on search term
  const filteredItems = items.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (item.seller.fullName && item.seller.fullName.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  const content = (
    <div className={isMobile ? "p-4" : "" }>
      {/* Header with search and add button */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500 h-4 w-4" />
          <Input
            placeholder="Search marketplace..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Button onClick={() => setIsAddItemOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> List New Item
        </Button>
      </div>
      
      {/* Marketplace tabs and items */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Marketplace Items</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="services">Services</TabsTrigger>
              <TabsTrigger value="my-listings">My Listings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all">
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <div key={n} className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm overflow-hidden h-64 skeleton"></div>
                  ))}
                </div>
              ) : filteredItems.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredItems.map((item) => (
                    <MarketplaceItem key={item.id} item={item} />
                  ))}
                </div>
              ) : (
                <div className="bg-neutral-50 dark:bg-neutral-900 rounded-lg py-10 text-center">
                  <p className="text-neutral-500 dark:text-neutral-400">
                    {searchTerm 
                      ? "No items match your search criteria." 
                      : "No marketplace items available at the moment."}
                  </p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="products">
              <div className="bg-neutral-50 dark:bg-neutral-900 rounded-lg py-10 text-center">
                <p className="text-neutral-500 dark:text-neutral-400">
                  Product category filter coming soon.
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="services">
              <div className="bg-neutral-50 dark:bg-neutral-900 rounded-lg py-10 text-center">
                <p className="text-neutral-500 dark:text-neutral-400">
                  Service category filter coming soon.
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="my-listings">
              <div className="bg-neutral-50 dark:bg-neutral-900 rounded-lg py-10 text-center">
                <p className="text-neutral-500 dark:text-neutral-400">
                  Your listings will appear here.
                </p>
                <Button className="mt-4" onClick={() => setIsAddItemOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" /> List New Item
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Create Item Dialog */}
      <Dialog open={isAddItemOpen} onOpenChange={setIsAddItemOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>List Item for Sale</DialogTitle>
            <DialogDescription>
              Add an item or service to the marketplace.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...createItemForm}>
            <form onSubmit={createItemForm.handleSubmit(onCreateItemSubmit)} className="space-y-4">
              <FormField
                control={createItemForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Fresh Organic Vegetables" {...field} />
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
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Fresh harvest from my farm" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={createItemForm.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price (KES)</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" step="any" {...field} />
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
                      <FormLabel>Category (Optional)</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
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
                    <FormLabel>Image URL (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/image.jpg" {...field} />
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
                    <FormLabel>Chama ID (Optional)</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" placeholder="Associate with a chama" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="submit" disabled={createItemForm.formState.isSubmitting}>
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
    <>
      {isMobile ? (
        <MobileLayout title="Marketplace">
          {content}
        </MobileLayout>
      ) : (
        <DesktopLayout title="Marketplace" subtitle="Buy and sell products and services">
          {content}
        </DesktopLayout>
      )}
    </>
  );
};

export default MarketplacePage;
