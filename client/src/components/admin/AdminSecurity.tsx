import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Lock, 
  FileText, 
  AlertTriangle,
  Search,
  Download,
  Eye,
  MoreVertical,
  RefreshCw,
  Key,
  UserX,
  Bell,
  ShieldOff,
  ShieldAlert
} from 'lucide-react';

// Mock data for audit log
const auditLogMock = [
  {
    id: 1,
    action: 'User Login',
    user: 'admin',
    ip: '192.168.1.105',
    timestamp: '2025-05-06T08:12:34Z',
    details: 'Successful login from Chrome on MacOS'
  },
  {
    id: 2,
    action: 'User Suspended',
    user: 'admin',
    ip: '192.168.1.105',
    timestamp: '2025-05-06T07:45:12Z',
    details: 'User marksmith (ID: 3) was suspended for suspicious activity'
  },
  {
    id: 3,
    action: 'Settings Changed',
    user: 'admin',
    ip: '192.168.1.105',
    timestamp: '2025-05-05T16:30:22Z',
    details: 'System settings updated: maintenance mode enabled'
  },
  {
    id: 4,
    action: 'Permission Updated',
    user: 'admin',
    ip: '192.168.1.105',
    timestamp: '2025-05-05T14:15:45Z',
    details: 'User janedoe (ID: 2) promoted to admin role'
  },
  {
    id: 5,
    action: 'Backup Created',
    user: 'system',
    ip: 'localhost',
    timestamp: '2025-05-05T12:00:00Z',
    details: 'Automated daily backup completed successfully'
  }
];

// Mock security alerts
const securityAlertsMock = [
  {
    id: 1,
    type: 'Login Attempt',
    severity: 'high',
    timestamp: '2025-05-06T07:12:34Z',
    status: 'open',
    details: 'Multiple failed login attempts for user johndoe from unusual IP address'
  },
  {
    id: 2,
    type: 'Suspicious Transaction',
    severity: 'medium',
    timestamp: '2025-05-05T19:45:12Z',
    status: 'investigating',
    details: 'Unusually large transaction initiated by user marksmith'
  },
  {
    id: 3,
    type: 'Permission Change',
    severity: 'low',
    timestamp: '2025-05-05T14:15:45Z',
    status: 'resolved',
    details: 'User role changed to admin for user janedoe'
  }
];

// Mock permission roles
const permissionRolesMock = [
  {
    id: 1,
    name: 'Administrator',
    description: 'Full system access and management capabilities',
    userCount: 2,
    permissions: [
      'users:read', 'users:write', 'users:delete',
      'chamas:read', 'chamas:write', 'chamas:delete',
      'transactions:read', 'transactions:write', 'transactions:delete',
      'settings:read', 'settings:write',
      'analytics:read'
    ]
  },
  {
    id: 2,
    name: 'Moderator',
    description: 'Monitoring and management of content and users',
    userCount: 3,
    permissions: [
      'users:read', 
      'chamas:read', 'chamas:write',
      'transactions:read',
      'settings:read'
    ]
  },
  {
    id: 3,
    name: 'Support',
    description: 'Customer support access',
    userCount: 5,
    permissions: [
      'users:read',
      'chamas:read',
      'transactions:read'
    ]
  },
  {
    id: 4,
    name: 'User',
    description: 'Regular user with standard permissions',
    userCount: 710,
    permissions: []
  }
];

// IP Whitelist/Blacklist data
const ipListMock = [
  { ip: '192.168.1.105', type: 'whitelist', description: 'Admin office IP', addedBy: 'admin', addedAt: '2025-04-01T10:00:00Z' },
  { ip: '10.0.0.15', type: 'whitelist', description: 'Development office', addedBy: 'admin', addedAt: '2025-04-01T10:05:00Z' },
  { ip: '203.45.67.89', type: 'blacklist', description: 'Suspicious activity', addedBy: 'system', addedAt: '2025-05-01T15:30:00Z' }
];

const AdminSecurity: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('audit');
  const [searchQuery, setSearchQuery] = useState('');
  const [twoFactorAuth, setTwoFactorAuth] = useState(true);
  const [passwordExpiry, setPasswordExpiry] = useState(true);
  const [loginAttemptLimit, setLoginAttemptLimit] = useState(5);
  const [sessionTimeout, setSessionTimeout] = useState(30);
  const [isPermissionDialogOpen, setIsPermissionDialogOpen] = useState(false);
  const [isIPDialogOpen, setIsIPDialogOpen] = useState(false);
  const [ipFormType, setIpFormType] = useState<'whitelist' | 'blacklist'>('whitelist');

  // Filter audit logs based on search query
  const filteredAuditLogs = auditLogMock.filter(log => 
    log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.details.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter security alerts based on search query
  const filteredAlerts = securityAlertsMock.filter(alert => 
    alert.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    alert.details.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSaveSecuritySettings = () => {
    toast({
      title: "Security settings saved",
      description: "Your security settings have been updated successfully.",
    });
  };

  const handleCreateRole = () => {
    toast({
      title: "Not implemented",
      description: "Create role functionality not yet implemented.",
    });
    setIsPermissionDialogOpen(false);
  };

  const handleAddIP = () => {
    toast({
      title: "IP address added",
      description: `The IP address has been added to the ${ipFormType}.`,
    });
    setIsIPDialogOpen(false);
  };

  const handleRunSecurityScan = () => {
    toast({
      title: "Security scan initiated",
      description: "A comprehensive security scan is now running. Results will be available shortly.",
    });
  };

  const handleExportAuditLog = () => {
    toast({
      title: "Audit log exported",
      description: "The audit log has been exported to your downloads folder.",
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl flex items-center">
          <Shield className="mr-2 h-5 w-5" /> 
          Security Center
        </CardTitle>
        <CardDescription>
          Manage system security, permissions, and monitor for suspicious activities.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="audit">Audit Log</TabsTrigger>
            <TabsTrigger value="alerts">Security Alerts</TabsTrigger>
            <TabsTrigger value="permissions">Permissions</TabsTrigger>
            <TabsTrigger value="settings">Security Settings</TabsTrigger>
          </TabsList>

          {/* Search bar - only shown for audit and alerts tabs */}
          {(activeTab === 'audit' || activeTab === 'alerts') && (
            <div className="relative mb-4">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-500" />
              <Input
                type="search"
                placeholder={`Search ${activeTab === 'audit' ? 'audit logs' : 'security alerts'}...`}
                className="w-full pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          )}

          {/* Audit Log Tab */}
          <TabsContent value="audit">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Action</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAuditLogs.length > 0 ? (
                    filteredAuditLogs.map(log => (
                      <TableRow key={log.id}>
                        <TableCell className="font-medium">{log.action}</TableCell>
                        <TableCell>{log.user}</TableCell>
                        <TableCell>{log.ip}</TableCell>
                        <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                        <TableCell className="max-w-xs truncate">{log.details}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-10">
                        No audit logs found matching your search criteria.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            <div className="mt-4 flex justify-end">
              <Button onClick={handleExportAuditLog} className="gap-1">
                <Download className="h-4 w-4" /> Export Audit Log
              </Button>
            </div>
          </TabsContent>

          {/* Security Alerts Tab */}
          <TabsContent value="alerts">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Alert Type</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAlerts.length > 0 ? (
                    filteredAlerts.map(alert => (
                      <TableRow key={alert.id}>
                        <TableCell className="font-medium">{alert.type}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              alert.severity === 'high' ? 'destructive' :
                              alert.severity === 'medium' ? 'default' :
                              'outline'
                            }
                          >
                            {alert.severity === 'high' && <AlertTriangle className="h-3 w-3 mr-1" />}
                            {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              alert.status === 'open' ? 'destructive' :
                              alert.status === 'investigating' ? 'default' :
                              'success'
                            }
                          >
                            {alert.status.charAt(0).toUpperCase() + alert.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(alert.timestamp).toLocaleString()}</TableCell>
                        <TableCell className="max-w-xs truncate">{alert.details}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => toast({ title: "Not implemented", description: "View details functionality not yet implemented." })}>
                                <Eye className="h-4 w-4 mr-2" /> View details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => toast({ title: "Not implemented", description: "Resolve alert functionality not yet implemented." })}>
                                <Shield className="h-4 w-4 mr-2" /> Mark as resolved
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {alert.type.includes('Login') && (
                                <DropdownMenuItem onClick={() => toast({ title: "Not implemented", description: "Block IP functionality not yet implemented." })}>
                                  <UserX className="h-4 w-4 mr-2" /> Block IP
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem onClick={() => toast({ title: "Not implemented", description: "Ignore alert functionality not yet implemented." })}>
                                <Bell className="h-4 w-4 mr-2" /> Ignore this alert
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-10">
                        No security alerts found matching your search criteria.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            <div className="mt-4 flex justify-between">
              <Button variant="outline" onClick={handleRunSecurityScan} className="gap-1">
                <Shield className="h-4 w-4" /> Run Security Scan
              </Button>
              <Button onClick={() => toast({ title: "Not implemented", description: "Generate security report functionality not yet implemented." })} className="gap-1">
                <FileText className="h-4 w-4" /> Generate Report
              </Button>
            </div>
          </TabsContent>

          {/* Permissions Tab */}
          <TabsContent value="permissions">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Permission Roles</h3>
                <Button size="sm" onClick={() => setIsPermissionDialogOpen(true)}>Create Role</Button>
              </div>
              
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Role Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Users</TableHead>
                      <TableHead>Permissions</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {permissionRolesMock.map(role => (
                      <TableRow key={role.id}>
                        <TableCell className="font-medium">{role.name}</TableCell>
                        <TableCell>{role.description}</TableCell>
                        <TableCell>{role.userCount}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {role.permissions.length > 0 ? (
                              <Badge variant="outline" className="whitespace-nowrap">
                                {role.permissions.length} permissions
                              </Badge>
                            ) : (
                              <Badge variant="outline">Default permissions</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => toast({ title: "Not implemented", description: "View role details functionality not yet implemented." })}>
                                <Eye className="h-4 w-4 mr-2" /> View details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => toast({ title: "Not implemented", description: "Edit role functionality not yet implemented." })}>
                                <Shield className="h-4 w-4 mr-2" /> Edit role
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => toast({ title: "Not implemented", description: "View users with role functionality not yet implemented." })}>
                                <Users className="h-4 w-4 mr-2" /> View users
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="border-t pt-5">
                <h3 className="text-lg font-medium mb-4">IP Access Control</h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  <Button 
                    size="sm" 
                    onClick={() => {
                      setIpFormType('whitelist');
                      setIsIPDialogOpen(true);
                    }}
                  >
                    Add to Whitelist
                  </Button>
                  <Button 
                    size="sm" 
                    variant="destructive" 
                    onClick={() => {
                      setIpFormType('blacklist');
                      setIsIPDialogOpen(true);
                    }}
                  >
                    Add to Blacklist
                  </Button>
                </div>
                
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>IP Address</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Added By</TableHead>
                        <TableHead>Added At</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ipListMock.map((ip, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{ip.ip}</TableCell>
                          <TableCell>
                            <Badge 
                              variant={ip.type === 'whitelist' ? 'success' : 'destructive'}
                            >
                              {ip.type === 'whitelist' ? (
                                <Shield className="h-3 w-3 mr-1" />
                              ) : (
                                <ShieldOff className="h-3 w-3 mr-1" />
                              )}
                              {ip.type.charAt(0).toUpperCase() + ip.type.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>{ip.description}</TableCell>
                          <TableCell>{ip.addedBy}</TableCell>
                          <TableCell>{new Date(ip.addedAt).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" onClick={() => toast({ 
                              title: "IP removed", 
                              description: `IP address ${ip.ip} has been removed from the ${ip.type}.` 
                            })}>
                              Remove
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Security Settings Tab */}
          <TabsContent value="settings">
            <div className="space-y-6">
              <div className="border-b pb-5">
                <h3 className="text-lg font-medium mb-4">Authentication Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="twoFactorAuth" className="font-medium">Two-Factor Authentication</Label>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        Require 2FA for all admin users
                      </p>
                    </div>
                    <Switch 
                      id="twoFactorAuth" 
                      checked={twoFactorAuth} 
                      onCheckedChange={setTwoFactorAuth} 
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="passwordExpiry" className="font-medium">Password Expiry</Label>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        Require password changes every 90 days
                      </p>
                    </div>
                    <Switch 
                      id="passwordExpiry" 
                      checked={passwordExpiry} 
                      onCheckedChange={setPasswordExpiry} 
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="loginAttemptLimit">Failed Login Attempt Limit</Label>
                      <Input 
                        id="loginAttemptLimit" 
                        type="number" 
                        min="1" 
                        value={loginAttemptLimit} 
                        onChange={(e) => setLoginAttemptLimit(parseInt(e.target.value || '5'))} 
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                      <Input 
                        id="sessionTimeout" 
                        type="number" 
                        min="1" 
                        value={sessionTimeout} 
                        onChange={(e) => setSessionTimeout(parseInt(e.target.value || '30'))} 
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="border-b pb-5">
                <h3 className="text-lg font-medium mb-4">Intrusion Detection</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="intrusionDetection" className="font-medium">Intrusion Detection System</Label>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        Automatically detect and alert on suspicious activities
                      </p>
                    </div>
                    <Switch id="intrusionDetection" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="autoBlock" className="font-medium">Automatic IP Blocking</Label>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        Automatically block IPs with suspicious activity
                      </p>
                    </div>
                    <Switch id="autoBlock" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="adminAlerts" className="font-medium">Admin Alerts</Label>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        Send email notifications for critical security events
                      </p>
                    </div>
                    <Switch id="adminAlerts" defaultChecked />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">Security Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button onClick={handleRunSecurityScan} className="gap-1">
                    <Shield className="h-4 w-4" /> Run Security Scan
                  </Button>
                  <Button onClick={() => toast({ title: "Not implemented", description: "Generate security report functionality not yet implemented." })} className="gap-1">
                    <FileText className="h-4 w-4" /> Generate Security Report
                  </Button>
                  <Button variant="outline" onClick={() => toast({ title: "Not implemented", description: "Reset all security settings to defaults." })} className="gap-1">
                    <RefreshCw className="h-4 w-4" /> Reset to Defaults
                  </Button>
                  <Button variant="destructive" onClick={() => toast({ title: "Not implemented", description: "Emergency lockdown functionality not yet implemented." })} className="gap-1">
                    <ShieldAlert className="h-4 w-4" /> Emergency Lockdown
                  </Button>
                </div>
              </div>
              
              <div className="pt-4">
                <Button onClick={handleSaveSecuritySettings} className="gap-1">
                  <Lock className="h-4 w-4" /> Save Security Settings
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>

      {/* Permission Role Dialog */}
      <Dialog open={isPermissionDialogOpen} onOpenChange={setIsPermissionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Role</DialogTitle>
            <DialogDescription>
              Define a new permission role with custom access levels.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="roleName">Role Name</Label>
              <Input id="roleName" placeholder="e.g., Finance Manager" />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="roleDescription">Description</Label>
              <Input id="roleDescription" placeholder="Brief description of this role's purpose" />
            </div>
            
            <div className="grid gap-2">
              <Label>Permissions</Label>
              <div className="space-y-2 border rounded-md p-3 max-h-60 overflow-y-auto">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="perm-users-read" className="h-4 w-4 rounded border-gray-300" defaultChecked />
                    <label htmlFor="perm-users-read" className="text-sm font-medium">users:read - View user information</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="perm-users-write" className="h-4 w-4 rounded border-gray-300" />
                    <label htmlFor="perm-users-write" className="text-sm font-medium">users:write - Modify user information</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="perm-users-delete" className="h-4 w-4 rounded border-gray-300" />
                    <label htmlFor="perm-users-delete" className="text-sm font-medium">users:delete - Delete users</label>
                  </div>
                </div>
                
                <div className="space-y-1 pt-2 border-t">
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="perm-chamas-read" className="h-4 w-4 rounded border-gray-300" defaultChecked />
                    <label htmlFor="perm-chamas-read" className="text-sm font-medium">chamas:read - View chama information</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="perm-chamas-write" className="h-4 w-4 rounded border-gray-300" />
                    <label htmlFor="perm-chamas-write" className="text-sm font-medium">chamas:write - Modify chama information</label>
                  </div>
                </div>
                
                <div className="space-y-1 pt-2 border-t">
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="perm-transactions-read" className="h-4 w-4 rounded border-gray-300" defaultChecked />
                    <label htmlFor="perm-transactions-read" className="text-sm font-medium">transactions:read - View transactions</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="perm-transactions-write" className="h-4 w-4 rounded border-gray-300" />
                    <label htmlFor="perm-transactions-write" className="text-sm font-medium">transactions:write - Perform transactions</label>
                  </div>
                </div>
                
                <div className="space-y-1 pt-2 border-t">
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="perm-settings-read" className="h-4 w-4 rounded border-gray-300" />
                    <label htmlFor="perm-settings-read" className="text-sm font-medium">settings:read - View system settings</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="perm-settings-write" className="h-4 w-4 rounded border-gray-300" />
                    <label htmlFor="perm-settings-write" className="text-sm font-medium">settings:write - Modify system settings</label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPermissionDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateRole}>Create Role</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* IP Management Dialog */}
      <Dialog open={isIPDialogOpen} onOpenChange={setIsIPDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Add IP to {ipFormType.charAt(0).toUpperCase() + ipFormType.slice(1)}
            </DialogTitle>
            <DialogDescription>
              {ipFormType === 'whitelist' 
                ? 'Add an IP address to the whitelist to allow access even during suspicious activity.'
                : 'Add an IP address to the blacklist to block all access from this address.'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="ipAddress">IP Address</Label>
              <Input id="ipAddress" placeholder="e.g., 192.168.1.1" />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="ipDescription">Description</Label>
              <Input id="ipDescription" placeholder="e.g., Office IP address" />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsIPDialogOpen(false)}>Cancel</Button>
            <Button 
              variant={ipFormType === 'blacklist' ? 'destructive' : 'default'}
              onClick={handleAddIP}
            >
              {ipFormType === 'whitelist' ? (
                <Shield className="h-4 w-4 mr-2" />
              ) : (
                <ShieldOff className="h-4 w-4 mr-2" />
              )}
              Add to {ipFormType.charAt(0).toUpperCase() + ipFormType.slice(1)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default AdminSecurity;