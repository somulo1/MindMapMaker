import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// Password change schema
const passwordChangeSchema = z.object({
  currentPassword: z.string().min(6, { message: "Current password is required" }),
  newPassword: z.string().min(6, { message: "New password must be at least 6 characters" }),
  confirmPassword: z.string().min(6, { message: "Confirm password is required" }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

interface User {
  id: number;
  username: string;
  email: string;
}

interface SecuritySettingsProps {
  user: User;
}

const SecuritySettings: React.FC<SecuritySettingsProps> = ({ user }) => {
  const { toast } = useToast();
  const [twoFactorEnabled, setTwoFactorEnabled] = React.useState(false);
  
  const form = useForm<z.infer<typeof passwordChangeSchema>>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });
  
  const onSubmit = (values: z.infer<typeof passwordChangeSchema>) => {
    // In a real implementation, this would update the password
    toast({
      title: "Password Updated",
      description: "Your password has been changed successfully.",
    });
    
    form.reset();
  };
  
  const handleTwoFactorToggle = (enabled: boolean) => {
    setTwoFactorEnabled(enabled);
    
    toast({
      title: `Two-Factor Authentication ${enabled ? 'Enabled' : 'Disabled'}`,
      description: enabled 
        ? "Your account is now more secure." 
        : "Two-factor authentication has been disabled.",
    });
  };
  
  return (
    <div className="space-y-6">
      <div className="bg-neutral-50 dark:bg-neutral-900 rounded-lg p-4 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-medium">Account Information</h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Your basic account information.</p>
          </div>
        </div>
        
        <div className="mt-4 space-y-4">
          <div className="flex justify-between">
            <span className="text-sm text-neutral-500 dark:text-neutral-400">Username</span>
            <span className="text-sm font-medium">{user.username}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-sm text-neutral-500 dark:text-neutral-400">Email</span>
            <span className="text-sm font-medium">{user.email}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-sm text-neutral-500 dark:text-neutral-400">User ID</span>
            <span className="text-sm font-medium">{user.id}</span>
          </div>
        </div>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <h3 className="font-medium">Change Password</h3>
          
          <FormField
            control={form.control}
            name="currentPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Current Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="newPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm New Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="flex justify-end">
            <Button type="submit">Change Password</Button>
          </div>
        </form>
      </Form>
      
      <div className="pt-6 border-t border-neutral-200 dark:border-neutral-700">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-medium">Two-Factor Authentication</h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Add an extra layer of security to your account.
            </p>
          </div>
          <Switch
            checked={twoFactorEnabled}
            onCheckedChange={handleTwoFactorToggle}
          />
        </div>
        
        {twoFactorEnabled && (
          <div className="mt-4 bg-neutral-50 dark:bg-neutral-900 rounded-lg p-4">
            <p className="text-sm text-neutral-700 dark:text-neutral-300 mb-2">
              Two-factor authentication is enabled. You'll need to enter a verification code whenever you sign in.
            </p>
            <Button variant="outline" size="sm">
              Configure 2FA
            </Button>
          </div>
        )}
      </div>
      
      <div className="pt-6 border-t border-neutral-200 dark:border-neutral-700">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-medium">Security Log</h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Track recent account activity.
            </p>
          </div>
          <Button variant="outline" size="sm">
            View Log
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SecuritySettings;
