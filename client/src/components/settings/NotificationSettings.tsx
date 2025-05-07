import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const NotificationSettings: React.FC = () => {
  const { toast } = useToast();
  const [settings, setSettings] = React.useState({
    pushNotifications: true,
    emailNotifications: true,
    smsNotifications: false,
    transactionAlerts: true,
    marketplaceUpdates: false,
    chamaNotifications: true,
    learningContentAlerts: false,
    promotionalEmails: false,
  });
  
  const handleToggle = (setting: string) => (checked: boolean) => {
    setSettings(prev => ({ ...prev, [setting]: checked }));
  };
  
  const handleSave = () => {
    // In a real implementation, this would save the notification settings
    toast({
      title: "Settings Saved",
      description: "Your notification preferences have been updated.",
    });
  };
  
  return (
    <div className="space-y-6">
      {/* Push Notifications */}
      <div className="space-y-4">
        <h3 className="font-medium">Push Notifications</h3>
        
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="push-notifications" className="font-normal">Enable Push Notifications</Label>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Receive notifications on your device.
            </p>
          </div>
          <Switch 
            id="push-notifications" 
            checked={settings.pushNotifications}
            onCheckedChange={handleToggle('pushNotifications')}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="transaction-alerts" className="font-normal">Transaction Alerts</Label>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Receive alerts for deposits, withdrawals, and transfers.
            </p>
          </div>
          <Switch 
            id="transaction-alerts" 
            checked={settings.transactionAlerts}
            onCheckedChange={handleToggle('transactionAlerts')}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="chama-notifications" className="font-normal">Chama Updates</Label>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Receive updates about your Chama groups.
            </p>
          </div>
          <Switch 
            id="chama-notifications" 
            checked={settings.chamaNotifications}
            onCheckedChange={handleToggle('chamaNotifications')}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="marketplace-updates" className="font-normal">Marketplace Listings</Label>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Receive notifications about new marketplace listings.
            </p>
          </div>
          <Switch 
            id="marketplace-updates" 
            checked={settings.marketplaceUpdates}
            onCheckedChange={handleToggle('marketplaceUpdates')}
          />
        </div>
      </div>
      
      {/* Email Notifications */}
      <div className="space-y-4 pt-6 border-t border-neutral-200 dark:border-neutral-700">
        <h3 className="font-medium">Email Notifications</h3>
        
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="email-notifications" className="font-normal">Enable Email Notifications</Label>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Receive notifications via email.
            </p>
          </div>
          <Switch 
            id="email-notifications" 
            checked={settings.emailNotifications}
            onCheckedChange={handleToggle('emailNotifications')}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="learning-content" className="font-normal">Learning Resources</Label>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Receive email alerts about new learning resources.
            </p>
          </div>
          <Switch 
            id="learning-content" 
            checked={settings.learningContentAlerts}
            onCheckedChange={handleToggle('learningContentAlerts')}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="promotional-emails" className="font-normal">Promotional Emails</Label>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Receive promotional offers and updates.
            </p>
          </div>
          <Switch 
            id="promotional-emails" 
            checked={settings.promotionalEmails}
            onCheckedChange={handleToggle('promotionalEmails')}
          />
        </div>
      </div>
      
      {/* SMS Notifications */}
      <div className="space-y-4 pt-6 border-t border-neutral-200 dark:border-neutral-700">
        <h3 className="font-medium">SMS Notifications</h3>
        
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="sms-notifications" className="font-normal">Enable SMS Notifications</Label>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Receive notifications via SMS (standard rates may apply).
            </p>
          </div>
          <Switch 
            id="sms-notifications" 
            checked={settings.smsNotifications}
            onCheckedChange={handleToggle('smsNotifications')}
          />
        </div>
      </div>
      
      <div className="flex justify-end pt-6">
        <Button onClick={handleSave}>Save Preferences</Button>
      </div>
    </div>
  );
};

export default NotificationSettings;