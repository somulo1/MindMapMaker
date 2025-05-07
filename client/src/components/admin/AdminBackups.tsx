import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Database, AlertCircle, CheckCircle, Download, Loader2 } from 'lucide-react';

async function createBackup() {
  const response = await fetch('/api/admin/backups/create', {
    method: 'POST',
  });
  if (!response.ok) throw new Error('Failed to create backup');
  return response.json();
}

const AdminBackups: React.FC = () => {
  const { toast } = useToast();

  const { data: backups, isLoading } = useQuery({
    queryKey: ['/api/admin/backups'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/admin/backups');
      return res.json();
    }
  });

  const createBackupMutation = useMutation({
    mutationFn: createBackup,
    onSuccess: () => {
      toast({
        title: "Backup created successfully",
        description: "System data has been backed up to secure storage"
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to create backup",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Database className="h-5 w-5" />
            System Backups
          </CardTitle>
          <CardDescription>
            Manage and create system backups
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button 
              onClick={() => createBackupMutation.mutate()}
              disabled={createBackupMutation.isPending}
              className="w-full sm:w-auto"
            >
              {createBackupMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Backup...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Create New Backup
                </>
              )}
            </Button>

            <div className="space-y-4">
              {isLoading ? (
                <div className="text-center py-4">Loading backups...</div>
              ) : backups?.length > 0 ? (
                backups.map((backup: any) => (
                  <div 
                    key={backup.id} 
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <div>
                        <p className="font-medium">{backup.filename}</p>
                        <p className="text-sm text-neutral-500">
                          {new Date(backup.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Download
                    </Button>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-neutral-500">
                  No backups found
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminBackups;