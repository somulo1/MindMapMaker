import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  CheckCircle, 
  XCircle, 
  Edit, 
  MoreVertical, 
  UserPlus, 
  Filter, 
  Search,
  Shield,
  Users 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

// Mock data for now - will be replaced with real API calls
const usersMock = [
  { 
    id: 1, 
    username: 'johndoe', 
    email: 'john@example.com', 
    fullName: 'John Doe', 
    status: 'active',
    role: 'user',
    createdAt: '2023-05-01',
    lastLogin: '2023-06-15',
    chamaCount: 3
  },
  { 
    id: 2, 
    username: 'janedoe', 
    email: 'jane@example.com', 
    fullName: 'Jane Doe', 
    status: 'active',
    role: 'user',
    createdAt: '2023-05-02',
    lastLogin: '2023-06-14',
    chamaCount: 2
  },
  { 
    id: 3, 
    username: 'marksmith', 
    email: 'mark@example.com', 
    fullName: 'Mark Smith', 
    status: 'suspended',
    role: 'user',
    createdAt: '2023-05-03',
    lastLogin: '2023-06-01',
    chamaCount: 1
  },
  { 
    id: 4, 
    username: 'sarahjones', 
    email: 'sarah@example.com', 
    fullName: 'Sarah Jones', 
    status: 'pending',
    role: 'user',
    createdAt: '2023-05-10',
    lastLogin: null,
    chamaCount: 0
  },
  { 
    id: 5, 
    username: 'admin', 
    email: 'admin@tujifund.com', 
    fullName: 'System Admin', 
    status: 'active',
    role: 'admin',
    createdAt: '2023-01-01',
    lastLogin: '2023-06-15',
    chamaCount: 1
  }
];

const chamasMock = [
  {
    id: 1,
    name: 'Investment Group A',
    description: 'Long term investment group',
    memberCount: 8,
    status: 'active',
    createdAt: '2023-03-15',
    balance: 25000,
    createdBy: 1
  },
  {
    id: 2,
    name: 'Savings Club B',
    description: 'Weekly savings group',
    memberCount: 12,
    status: 'active',
    createdAt: '2023-04-01',
    balance: 35000,
    createdBy: 2
  },
  {
    id: 3,
    name: 'Housing Project',
    description: 'Saving for house construction',
    memberCount: 5,
    status: 'pending',
    createdAt: '2023-05-10',
    balance: 15000,
    createdBy: 1
  },
  {
    id: 4,
    name: 'Small Business Fund',
    description: 'Supporting small businesses',
    memberCount: 10,
    status: 'active',
    createdAt: '2023-02-20',
    balance: 50000,
    createdBy: 3
  }
];

const AdminUserManagement: React.FC = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('users');
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [isChamaDialogOpen, setIsChamaDialogOpen] = useState(false);
  
  // Simulated queries
  const { data: users = usersMock, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: async () => {
      // Uncomment when API endpoint is ready
      // const res = await apiRequest('GET', '/api/admin/users');
      // return await res.json();
      return usersMock;
    },
  });

  const { data: chamas = chamasMock, isLoading: isLoadingChamas } = useQuery({
    queryKey: ['adminChamas'],
    queryFn: async () => {
      // Uncomment when API endpoint is ready
      // const res = await apiRequest('GET', '/api/admin/chamas');
      // return await res.json();
      return chamasMock;
    },
  });

  const queryClient = useQueryClient();

  // User actions mutations
  const updateUserStatusMutation = useMutation({
    mutationFn: async ({ userId, status }: { userId: number, status: string }) => {
      // Uncomment when API endpoint is ready
      // const res = await apiRequest('PATCH', `/api/admin/users/${userId}/status`, { status });
      // return await res.json();
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      toast({ 
        title: "User status updated",
        description: "The user status has been successfully updated.",
      });
    },
    onError: (error: any) => {
      toast({ 
        variant: "destructive",
        title: "Failed to update user",
        description: error.message || "An error occurred. Please try again.",
      });
    },
  });

  // Chama actions mutations
  const updateChamaStatusMutation = useMutation({
    mutationFn: async ({ chamaId, status }: { chamaId: number, status: string }) => {
      // Uncomment when API endpoint is ready
      // const res = await apiRequest('PATCH', `/api/admin/chamas/${chamaId}/status`, { status });
      // return await res.json();
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminChamas'] });
      toast({ 
        title: "Chama status updated",
        description: "The chama status has been successfully updated.",
      });
    },
    onError: (error: any) => {
      toast({ 
        variant: "destructive",
        title: "Failed to update chama",
        description: error.message || "An error occurred. Please try again.",
      });
    },
  });

  // Filter users based on search query
  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) || 
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter chamas based on search query
  const filteredChamas = chamas.filter(chama => 
    chama.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    chama.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // User status change handler
  const handleUserStatusChange = (userId: number, newStatus: string) => {
    updateUserStatusMutation.mutate({ userId, status: newStatus });
  };

  // Chama status change handler
  const handleChamaStatusChange = (chamaId: number, newStatus: string) => {
    updateChamaStatusMutation.mutate({ chamaId, status: newStatus });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl flex items-center">
          <Users className="mr-2 h-5 w-5" /> 
          User and Chama Management
        </CardTitle>
        <CardDescription>
          Manage users and chama groups, including verification, suspension, and more.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="chamas">Chamas</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-grow">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-500" />
              <Input
                type="search"
                placeholder="Search by name, email, or username..."
                className="w-full pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" size="sm" className="gap-1">
              <Filter className="h-4 w-4" /> Filter
            </Button>
            {selectedTab === 'users' ? (
              <Button size="sm" className="gap-1" onClick={() => setIsUserDialogOpen(true)}>
                <UserPlus className="h-4 w-4" /> Add User
              </Button>
            ) : (
              <Button size="sm" className="gap-1" onClick={() => setIsChamaDialogOpen(true)}>
                <UserPlus className="h-4 w-4" /> Create Chama
              </Button>
            )}
          </div>

          <TabsContent value="users">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Chamas</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingUsers ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-10">Loading users...</TableCell>
                    </TableRow>
                  ) : filteredUsers.length > 0 ? (
                    filteredUsers.map(user => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          <div>
                            <p className="font-semibold">{user.fullName}</p>
                            <p className="text-sm text-neutral-500">{user.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              user.status === 'active' ? 'success' : 
                              user.status === 'suspended' ? 'destructive' : 
                              'outline'
                            }
                          >
                            {user.status === 'active' && <CheckCircle className="h-3 w-3 mr-1" />}
                            {user.status === 'suspended' && <XCircle className="h-3 w-3 mr-1" />}
                            {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={user.role === 'admin' ? 'secondary' : 'outline'}
                          >
                            {user.role === 'admin' && <Shield className="h-3 w-3 mr-1" />}
                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>{user.chamaCount}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => toast({ title: "Not implemented", description: "View user details functionality not yet implemented." })}>
                                View details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => toast({ title: "Not implemented", description: "Edit user functionality not yet implemented." })}>
                                Edit user
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {user.status === 'active' ? (
                                <DropdownMenuItem 
                                  className="text-destructive focus:text-destructive"
                                  onClick={() => handleUserStatusChange(user.id, 'suspended')}
                                >
                                  Suspend user
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem 
                                  onClick={() => handleUserStatusChange(user.id, 'active')}
                                >
                                  Activate user
                                </DropdownMenuItem>
                              )}
                              {user.role === 'user' ? (
                                <DropdownMenuItem 
                                  onClick={() => toast({ title: "Not implemented", description: "Make admin functionality not yet implemented." })}
                                >
                                  Make admin
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem 
                                  onClick={() => toast({ title: "Not implemented", description: "Remove admin rights functionality not yet implemented." })}
                                >
                                  Remove admin rights
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-10">
                        No users found matching your search criteria.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="chamas">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Chama</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Members</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingChamas ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-10">Loading chamas...</TableCell>
                    </TableRow>
                  ) : filteredChamas.length > 0 ? (
                    filteredChamas.map(chama => (
                      <TableRow key={chama.id}>
                        <TableCell className="font-medium">
                          <div>
                            <p className="font-semibold">{chama.name}</p>
                            <p className="text-sm text-neutral-500">{chama.description}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              chama.status === 'active' ? 'success' : 
                              chama.status === 'suspended' ? 'destructive' : 
                              'outline'
                            }
                          >
                            {chama.status === 'active' && <CheckCircle className="h-3 w-3 mr-1" />}
                            {chama.status === 'suspended' && <XCircle className="h-3 w-3 mr-1" />}
                            {chama.status.charAt(0).toUpperCase() + chama.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>{chama.memberCount}</TableCell>
                        <TableCell>{new Date(chama.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>KES {chama.balance.toLocaleString()}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => toast({ title: "Not implemented", description: "View chama details functionality not yet implemented." })}>
                                View details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => toast({ title: "Not implemented", description: "Edit chama functionality not yet implemented." })}>
                                Edit chama
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {chama.status === 'active' ? (
                                <DropdownMenuItem 
                                  className="text-destructive focus:text-destructive"
                                  onClick={() => handleChamaStatusChange(chama.id, 'suspended')}
                                >
                                  Suspend chama
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem 
                                  onClick={() => handleChamaStatusChange(chama.id, 'active')}
                                >
                                  Activate chama
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem 
                                onClick={() => toast({ title: "Not implemented", description: "View transactions functionality not yet implemented." })}
                              >
                                View transactions
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-10">
                        No chamas found matching your search criteria.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>

        {/* Create User Dialog */}
        <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
              <DialogDescription>
                Add a new user to the Tujifund platform. All users start with regular privileges.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label htmlFor="username" className="text-sm font-medium">Username</label>
                  <Input id="username" placeholder="username" />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="email" className="text-sm font-medium">Email</label>
                  <Input id="email" type="email" placeholder="email@example.com" />
                </div>
              </div>
              <div className="grid gap-2">
                <label htmlFor="fullName" className="text-sm font-medium">Full Name</label>
                <Input id="fullName" placeholder="John Doe" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label htmlFor="password" className="text-sm font-medium">Password</label>
                  <Input id="password" type="password" />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</label>
                  <Input id="confirmPassword" type="password" />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsUserDialogOpen(false)}>Cancel</Button>
              <Button onClick={() => {
                toast({ 
                  title: "User created", 
                  description: "New user has been created successfully."
                });
                setIsUserDialogOpen(false);
              }}>Create User</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create Chama Dialog */}
        <Dialog open={isChamaDialogOpen} onOpenChange={setIsChamaDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Chama</DialogTitle>
              <DialogDescription>
                Create a new chama group for users to join and collaborate.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4">
              <div className="grid gap-2">
                <label htmlFor="chamaName" className="text-sm font-medium">Chama Name</label>
                <Input id="chamaName" placeholder="Investment Group" />
              </div>
              <div className="grid gap-2">
                <label htmlFor="description" className="text-sm font-medium">Description</label>
                <Input id="description" placeholder="A group for collaborative investing" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label htmlFor="creator" className="text-sm font-medium">Creator</label>
                  <Input id="creator" placeholder="User ID or username" />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="initialBalance" className="text-sm font-medium">Initial Balance (KES)</label>
                  <Input id="initialBalance" type="number" defaultValue="0" />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsChamaDialogOpen(false)}>Cancel</Button>
              <Button onClick={() => {
                toast({ 
                  title: "Chama created", 
                  description: "New chama has been created successfully."
                });
                setIsChamaDialogOpen(false);
              }}>Create Chama</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default AdminUserManagement;