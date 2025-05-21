import { useState } from 'react';
import { useChama } from '@/hooks/useChama';
import { useToast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

// Create Chama Schema
const createChamaSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters" }),
  description: z.string().optional(),
  icon: z.string().default("groups"),
  iconBg: z.string().default("primary"),
});

interface CreateChamaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateChamaDialog({ open, onOpenChange }: CreateChamaDialogProps) {
  const { createChama } = useChama();
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof createChamaSchema>>({
    resolver: zodResolver(createChamaSchema),
    defaultValues: { 
      name: "", 
      description: "", 
      icon: "groups", 
      iconBg: "primary" 
    },
  });
  
  const onSubmit = async (values: z.infer<typeof createChamaSchema>) => {
    try {
      await createChama(values);
      toast({
        title: "Chama created",
        description: `Your new chama "${values.name}" has been created.`,
      });
      onOpenChange(false);
      form.reset();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to create chama",
        description: error?.message || "An error occurred while creating the chama.",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Chama</DialogTitle>
          <DialogDescription>
            Start a new savings or investment group with friends and family.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chama Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter chama name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Brief description of your chama" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit">Create Chama</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 