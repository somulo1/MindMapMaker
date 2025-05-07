import React, { useState } from 'react';
import { useMediaQuery } from '@/hooks/use-mobile';
import MobileLayout from '@/components/layouts/MobileLayout';
import DesktopLayout from '@/components/layouts/DesktopLayout';
import { useChama } from '@/hooks/useChama';
import ChamaCard from '@/components/chama/ChamaCard';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';

// Create Chama Schema
const createChamaSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters" }),
  description: z.string().optional(),
  icon: z.string().default("groups"),
  iconBg: z.string().default("primary"),
});

const ChamasDashboardPage: React.FC = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { chamas, createChama, isLoading } = useChama();
  const { toast } = useToast();
  const [isChamaOpen, setIsChamaOpen] = useState(false);
  
  const chamaForm = useForm<z.infer<typeof createChamaSchema>>({
    resolver: zodResolver(createChamaSchema),
    defaultValues: { 
      name: "", 
      description: "", 
      icon: "groups", 
      iconBg: "primary" 
    },
  });
  
  // Handle create chama submit
  const onCreateChamaSubmit = async (values: z.infer<typeof createChamaSchema>) => {
    try {
      await createChama(values);
      toast({
        title: "Chama created",
        description: `Your new chama "${values.name}" has been created.`,
      });
      setIsChamaOpen(false);
      chamaForm.reset();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to create chama",
        description: error.message || "An error occurred while creating the chama.",
      });
    }
  };

  const content = (
    <div className={isMobile ? "p-4" : ""}>
      <div className={`flex justify-between items-center ${isMobile ? "mb-4" : "mb-6"}`}>
        {isMobile && <h1 className="text-xl font-bold">My Chamas</h1>}
        <Button onClick={() => setIsChamaOpen(true)} className={isMobile ? "ml-auto" : ""}>
          <Plus className="mr-2 h-4 w-4" /> Create New Chama
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          // Skeleton loading cards
          <>
            <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm overflow-hidden h-64 skeleton"></div>
            <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm overflow-hidden h-64 skeleton"></div>
            <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm overflow-hidden h-64 skeleton"></div>
          </>
        ) : chamas.length > 0 ? (
          // Display chamas
          chamas.map(chama => (
            <ChamaCard key={chama.id} chama={chama} />
          ))
        ) : (
          // If no chamas, display message
          <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm p-5 col-span-full">
            <p className="text-center text-neutral-600 dark:text-neutral-400">
              You don't have any chamas yet. Create one to get started!
            </p>
          </div>
        )}
        
        {/* Create New Chama Card */}
        <div 
          className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border-2 border-dashed border-neutral-300 dark:border-neutral-700 flex flex-col items-center justify-center p-8 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-750 transition-colors"
          onClick={() => setIsChamaOpen(true)}
        >
          <div className="w-16 h-16 rounded-full bg-neutral-100 dark:bg-neutral-700 flex items-center justify-center mb-4">
            <Plus className="h-8 w-8 text-neutral-500 dark:text-neutral-400" />
          </div>
          <h3 className="font-medium text-lg mb-2">Create New Chama</h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 text-center mb-4">
            Start a new savings or investment group with friends and family
          </p>
          <Button 
            variant="outline" 
            className="bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 text-neutral-800 dark:text-neutral-200 font-medium"
          >
            Get Started
          </Button>
        </div>
      </div>
    </div>
  );
  
  return (
    <>
      {isMobile ? (
        <MobileLayout title="My Chamas">
          {content}
        </MobileLayout>
      ) : (
        <DesktopLayout title="My Chamas" subtitle="Manage your savings and investment groups">
          {content}
        </DesktopLayout>
      )}
      
      {/* Create Chama Dialog */}
      <Dialog open={isChamaOpen} onOpenChange={setIsChamaOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Chama</DialogTitle>
            <DialogDescription>
              Start a new savings or investment group with friends and family.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...chamaForm}>
            <form onSubmit={chamaForm.handleSubmit(onCreateChamaSubmit)} className="space-y-4">
              <FormField
                control={chamaForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chama Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Kilimani Investment Chama" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={chamaForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., A group for real estate investments" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={chamaForm.control}
                  name="icon"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Icon</FormLabel>
                      <FormControl>
                        <select 
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          {...field}
                        >
                          <option value="groups">Group</option>
                          <option value="grass">Agriculture</option>
                          <option value="account_balance">Finance</option>
                          <option value="storefront">Business</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={chamaForm.control}
                  name="iconBg"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Theme Color</FormLabel>
                      <FormControl>
                        <select 
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          {...field}
                        >
                          <option value="primary">Blue</option>
                          <option value="secondary">Green</option>
                          <option value="accent">Orange</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <DialogFooter>
                <Button type="submit" disabled={chamaForm.formState.isSubmitting}>
                  {chamaForm.formState.isSubmitting ? "Creating..." : "Create Chama"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ChamasDashboardPage;
