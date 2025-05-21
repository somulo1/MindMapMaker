import React from 'react';
import { useMediaQuery } from '@/hooks/use-mobile';
import UserLayout from '@/components/layout/UserLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ProfileSettings from '@/components/settings/ProfileSettings';
import SecuritySettings from '@/components/settings/SecuritySettings';
import NotificationSettings from '@/components/settings/NotificationSettings';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';

const SettingsPage: React.FC = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [_, navigate] = useLocation();
  
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Logout failed",
        description: "An error occurred while logging out.",
      });
    }
  };
  
  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  return (
    <UserLayout title="Settings">
      <div className={isMobile ? "p-4" : ""}>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Account Settings</CardTitle>
            <CardDescription>
              Manage your account settings and preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="grid grid-cols-3 mb-6">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
              </TabsList>
              
              <TabsContent value="profile">
                <ProfileSettings user={user} />
              </TabsContent>
              
              <TabsContent value="security">
                <SecuritySettings user={user} />
              </TabsContent>
              
              <TabsContent value="notifications">
                <NotificationSettings />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        <Card className="mt-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-red-600 dark:text-red-500">Danger Zone</CardTitle>
            <CardDescription>
              Actions here can't be undone
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-1">Delete Account</h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-2">
                  Once you delete your account, there is no going back. Please be certain.
                </p>
                <Button variant="destructive">Delete Account</Button>
              </div>
              
              <div>
                <h3 className="font-medium mb-1">Logout</h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-2">
                  Sign out of your account on this device.
                </p>
                <Button variant="outline" onClick={handleLogout}>Logout</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </UserLayout>
  );
};

export default SettingsPage;
