
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Download, Upload, RefreshCw, Database } from 'lucide-react';

const AdminBackups: React.FC = () => {
  const { toast } = useToast();
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  const handleBackup = async () => {
    setIsBackingUp(true);
    try {
      // Implement backup logic here
      toast({
        title: "Backup created",
        description: "System backup has been created successfully.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Backup failed",
        description: "Failed to create system backup.",
      });
    }
    setIsBackingUp(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>System Backups</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              onClick={handleBackup} 
              disabled={isBackingUp}
              className="flex items-center"
            >
              <Database className="mr-2 h-4 w-4" />
              Create New Backup
            </Button>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Download Latest Backup
            </Button>
          </div>
          
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-4">Backup History</h3>
            <div className="space-y-2">
              {['backup_20240318.sql', 'backup_20240317.sql', 'backup_20240316.sql'].map((backup) => (
                <div key={backup} className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                  <span>{backup}</span>
                  <div className="space-x-2">
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminBackups;
