
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Database, AlertCircle, CheckCircle } from 'lucide-react';

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
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/admin/backups');
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Backup created",
        description: "System backup has been created successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Backup failed",
        description: error.message || "Failed to create system backup.",
      });
    }
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>System Backups</CardTitle>
          <CardDescription>
            Manage and create system backups
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button 
              onClick={() => createBackupMutation.mutate()}
              disabled={createBackupMutation.isPending}
            >
              <Database className="mr-2 h-4 w-4" />
              {createBackupMutation.isPending ? 'Creating backup...' : 'Create Backup'}
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
