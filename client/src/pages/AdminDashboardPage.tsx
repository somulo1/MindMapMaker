import React, { useState } from 'react';
import { useMediaQuery } from '@/hooks/use-mobile';
import MobileLayout from '@/components/layouts/MobileLayout';
import DesktopLayout from '@/components/layouts/DesktopLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Settings, 
  BarChart4, 
  Shield, 
  Database, 
  CreditCard, 
  Bot,
  LifeBuoy
} from 'lucide-react';
import AdminUserManagement from '@/components/admin/AdminUserManagement';
import AdminSystemSettings from '@/components/admin/AdminSystemSettings';
import AdminAnalytics from '@/components/admin/AdminAnalytics';
import AdminSecurity from '@/components/admin/AdminSecurity';
import AdminBackups from '@/components/admin/AdminBackups';
import AdminPayments from '@/components/admin/AdminPayments';
import AdminAISystem from '@/components/admin/AdminAISystem';
import AdminSupport from '@/components/admin/AdminSupport';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'wouter';

const AdminDashboardPage: React.FC = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [activeTab, setActiveTab] = useState<string>('users');
  const { user } = useAuth();

  // Check if user is admin
  if (!user || user.role !== 'admin') {
    return <Navigate to="/" />;
  }

  const pageTitle = "Admin Dashboard";
  const pageDescription = "Manage Tujifund system settings, users, and analyze platform performance.";

  const content = (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{pageTitle}</h1>
        <p className="text-neutral-500 dark:text-neutral-400">
          {pageDescription}
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-4 lg:grid-cols-8 h-auto gap-2">
          <TabsTrigger value="users" className="flex flex-col py-2 h-auto">
            <Users className="h-5 w-5 mb-1" />
            <span className="text-xs">Users</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex flex-col py-2 h-auto">
            <Settings className="h-5 w-5 mb-1" />
            <span className="text-xs">Settings</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex flex-col py-2 h-auto">
            <BarChart4 className="h-5 w-5 mb-1" />
            <span className="text-xs">Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex flex-col py-2 h-auto">
            <Shield className="h-5 w-5 mb-1" />
            <span className="text-xs">Security</span>
          </TabsTrigger>
          <TabsTrigger value="backups" className="flex flex-col py-2 h-auto">
            <Database className="h-5 w-5 mb-1" />
            <span className="text-xs">Backups</span>
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex flex-col py-2 h-auto">
            <CreditCard className="h-5 w-5 mb-1" />
            <span className="text-xs">Payments</span>
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex flex-col py-2 h-auto">
            <Bot className="h-5 w-5 mb-1" />
            <span className="text-xs">AI System</span>
          </TabsTrigger>
          <TabsTrigger value="support" className="flex flex-col py-2 h-auto">
            <LifeBuoy className="h-5 w-5 mb-1" />
            <span className="text-xs">Support</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <AdminUserManagement />
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <AdminSystemSettings />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <AdminAnalytics />
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <AdminSecurity />
        </TabsContent>

        <TabsContent value="backups" className="space-y-4">
          <AdminBackups />
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <AdminPayments />
        </TabsContent>

        <TabsContent value="ai" className="space-y-4">
          <AdminAISystem />
        </TabsContent>

        <TabsContent value="support" className="space-y-4">
          <AdminSupport />
        </TabsContent>
      </Tabs>
    </div>
  );

  return isMobile ? (
    <MobileLayout title={pageTitle}>
      {content}
    </MobileLayout>
  ) : (
    <DesktopLayout>
      {content}
    </DesktopLayout>
  );
};

export default AdminDashboardPage;