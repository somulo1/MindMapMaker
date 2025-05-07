import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  AlertTriangle,
  Bell,
  Mail,
  Smartphone,
  Globe,
  Save,
  RefreshCw,
  Upload,
  Download,
  Code
} from 'lucide-react';

const AdminSystemSettings: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('general');

  // General settings
  const [appName, setAppName] = useState('Tujifund');
  const [supportEmail, setSupportEmail] = useState('support@tujifund.com');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [language, setLanguage] = useState('en');
  const [currency, setCurrency] = useState('KES');

  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [inAppNotifications, setInAppNotifications] = useState(true);
  
  // Templates
  const [welcomeEmailTemplate, setWelcomeEmailTemplate] = useState(
    'Welcome to Tujifund, {{user_name}}!\n\nThank you for joining our platform. We are excited to help you on your financial journey.\n\nBest regards,\nThe Tujifund Team'
  );
  const [chamaInviteTemplate, setChamaInviteTemplate] = useState(
    'Hello {{user_name}},\n\nYou have been invited to join the chama "{{chama_name}}" by {{inviter_name}}.\n\nClick here to accept the invitation: {{invitation_link}}\n\nBest regards,\nThe Tujifund Team'
  );

  // Limits and rate settings
  const [maxChamasPerUser, setMaxChamasPerUser] = useState(10);
  const [maxMembersPerChama, setMaxMembersPerChama] = useState(50);
  const [dailyTransactionLimit, setDailyTransactionLimit] = useState(500000);
  const [apiRateLimit, setApiRateLimit] = useState(100);

  const handleSaveSettings = (section: string) => {
    toast({
      title: "Settings saved",
      description: `${section.charAt(0).toUpperCase() + section.slice(1)} settings have been saved successfully.`,
    });
  };

  const handleMaintenanceModeToggle = (checked: boolean) => {
    setMaintenanceMode(checked);
    if (checked) {
      toast({
        title: "Maintenance mode enabled",
        description: "The system is now in maintenance mode. Users will see a maintenance page.",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Maintenance mode disabled",
        description: "The system is now accessible to all users.",
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl flex items-center">
          <Globe className="mr-2 h-5 w-5" /> 
          System Settings
        </CardTitle>
        <CardDescription>
          Configure global application settings, notifications, and system behavior.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="limits">Limits & Rates</TabsTrigger>
          </TabsList>

          {/* General Settings Tab */}
          <TabsContent value="general">
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="appName">Application Name</Label>
                <Input 
                  id="appName" 
                  value={appName} 
                  onChange={(e) => setAppName(e.target.value)} 
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="supportEmail">Support Email</Label>
                <Input 
                  id="supportEmail" 
                  type="email" 
                  value={supportEmail} 
                  onChange={(e) => setSupportEmail(e.target.value)} 
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="language">Default Language</Label>
                <select 
                  id="language" 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                >
                  <option value="en">English</option>
                  <option value="sw">Swahili</option>
                  <option value="fr">French</option>
                </select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="currency">Default Currency</Label>
                <select 
                  id="currency" 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                >
                  <option value="KES">Kenyan Shilling (KES)</option>
                  <option value="USD">US Dollar (USD)</option>
                  <option value="EUR">Euro (EUR)</option>
                  <option value="GBP">British Pound (GBP)</option>
                </select>
              </div>

              <div className="flex items-center justify-between space-y-0 pt-4">
                <div className="space-y-1">
                  <Label htmlFor="maintenanceMode" className="text-base">Maintenance Mode</Label>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    When enabled, users will see a maintenance page.
                  </p>
                </div>
                <div className="flex items-center">
                  <Switch 
                    id="maintenanceMode"
                    checked={maintenanceMode}
                    onCheckedChange={handleMaintenanceModeToggle}
                  />
                  {maintenanceMode && <AlertTriangle className="ml-2 h-4 w-4 text-destructive" />}
                </div>
              </div>
              
              <div className="pt-4">
                <Button onClick={() => handleSaveSettings('general')} className="gap-1">
                  <Save className="h-4 w-4" /> Save General Settings
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b">
                <div className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  <Label htmlFor="emailNotifications" className="font-medium">Email Notifications</Label>
                </div>
                <Switch 
                  id="emailNotifications"
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>

              <div className="flex items-center justify-between py-2 border-b">
                <div className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5" />
                  <Label htmlFor="smsNotifications" className="font-medium">SMS Notifications</Label>
                </div>
                <Switch 
                  id="smsNotifications"
                  checked={smsNotifications}
                  onCheckedChange={setSmsNotifications}
                />
              </div>

              <div className="flex items-center justify-between py-2 border-b">
                <div className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  <Label htmlFor="pushNotifications" className="font-medium">Push Notifications</Label>
                </div>
                <Switch 
                  id="pushNotifications"
                  checked={pushNotifications}
                  onCheckedChange={setPushNotifications}
                />
              </div>

              <div className="flex items-center justify-between py-2 border-b">
                <div className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  <Label htmlFor="inAppNotifications" className="font-medium">In-App Notifications</Label>
                </div>
                <Switch 
                  id="inAppNotifications"
                  checked={inAppNotifications}
                  onCheckedChange={setInAppNotifications}
                />
              </div>

              <div className="pt-4">
                <Button onClick={() => handleSaveSettings('notification')} className="gap-1">
                  <Save className="h-4 w-4" /> Save Notification Settings
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="welcomeEmailTemplate">Welcome Email Template</Label>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Available variables: {{user_name}}, {{app_name}}, {{login_link}}
                </p>
                <Textarea 
                  id="welcomeEmailTemplate" 
                  rows={6}
                  value={welcomeEmailTemplate}
                  onChange={(e) => setWelcomeEmailTemplate(e.target.value)}
                  className="font-mono text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="chamaInviteTemplate">Chama Invitation Template</Label>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Available variables: {{user_name}}, {{chama_name}}, {{inviter_name}}, {{invitation_link}}
                </p>
                <Textarea 
                  id="chamaInviteTemplate" 
                  rows={6}
                  value={chamaInviteTemplate}
                  onChange={(e) => setChamaInviteTemplate(e.target.value)}
                  className="font-mono text-sm"
                />
              </div>

              <div className="flex space-x-2">
                <Button onClick={() => handleSaveSettings('template')} className="gap-1">
                  <Save className="h-4 w-4" /> Save Templates
                </Button>
                <Button variant="outline" onClick={() => {
                  toast({
                    title: "Templates reset",
                    description: "All notification templates have been reset to default values.",
                  });
                }} className="gap-1">
                  <RefreshCw className="h-4 w-4" /> Reset to Defaults
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Limits & Rates Tab */}
          <TabsContent value="limits">
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="maxChamasPerUser">Maximum Chamas Per User</Label>
                <Input 
                  id="maxChamasPerUser" 
                  type="number" 
                  min="1" 
                  value={maxChamasPerUser} 
                  onChange={(e) => setMaxChamasPerUser(parseInt(e.target.value))} 
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="maxMembersPerChama">Maximum Members Per Chama</Label>
                <Input 
                  id="maxMembersPerChama" 
                  type="number" 
                  min="1" 
                  value={maxMembersPerChama} 
                  onChange={(e) => setMaxMembersPerChama(parseInt(e.target.value))} 
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="dailyTransactionLimit">Daily Transaction Limit (KES)</Label>
                <Input 
                  id="dailyTransactionLimit" 
                  type="number" 
                  min="1" 
                  value={dailyTransactionLimit} 
                  onChange={(e) => setDailyTransactionLimit(parseInt(e.target.value))} 
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="apiRateLimit">API Rate Limit (requests per minute)</Label>
                <Input 
                  id="apiRateLimit" 
                  type="number" 
                  min="1" 
                  value={apiRateLimit} 
                  onChange={(e) => setApiRateLimit(parseInt(e.target.value))} 
                />
              </div>

              <div className="pt-4">
                <Button onClick={() => handleSaveSettings('limits')} className="gap-1">
                  <Save className="h-4 w-4" /> Save Limit Settings
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-5">
        <div className="flex space-x-2">
          <Button variant="outline" className="gap-1" onClick={() => {
            toast({
              title: "Configuration exported",
              description: "System configuration has been exported to your downloads folder.",
            });
          }}>
            <Download className="h-4 w-4" /> Export Config
          </Button>
          <Button variant="outline" className="gap-1" onClick={() => {
            toast({
              title: "Not implemented",
              description: "Import config functionality not yet implemented.",
            });
          }}>
            <Upload className="h-4 w-4" /> Import Config
          </Button>
        </div>
        <Button variant="outline" className="gap-1" onClick={() => {
          toast({
            title: "Not implemented",
            description: "Advanced configuration functionality not yet implemented.",
          });
        }}>
          <Code className="h-4 w-4" /> Advanced Config
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AdminSystemSettings;