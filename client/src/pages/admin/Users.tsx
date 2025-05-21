import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/layout/AdminLayout";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { 
  Users, 
  User, 
  Search, 
  MoreHorizontal, 
  UserCheck, 
  UserX, 
  Mail, 
  Edit, 
  Eye, 
  AlertTriangle,
  Shield,
  UserCog
} from "lucide-react";
import { User as UserType } from "@shared/schema";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface UserActivity {
  transactions: Array<{
    id: number;
    type: string;
    amount: number;
    createdAt: string;
  }>;
  messages: Array<{
    id: number;
    content: string;
    sentAt: string;
  }>;
  chamas: Array<{
    id: number;
    name: string;
    role: string;
  }>;
}

export default function AdminUsers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [viewUserDialogOpen, setViewUserDialogOpen] = useState(false);
  const [blockUserDialogOpen, setBlockUserDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Query for users and stats
  const { data: usersData, isLoading: isLoadingUsers } = useQuery<{ users: UserType[] }>({
    queryKey: ["/api/admin/users"],
  });

  const { data: statsData, isLoading: isLoadingStats } = useQuery<{
    total: number;
    active: number;
    admins: number;
    newLastWeek: number;
  }>({
    queryKey: ["/api/admin/users/stats"],
  });

  // Query for selected user's activity
  const { data: activityData, isLoading: isLoadingActivity } = useQuery<UserActivity>({
    queryKey: ["/api/admin/users", selectedUser?.id, "activity"],
    enabled: !!selectedUser,
  });
  
  // Mutations
  const blockUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      const response = await fetch(`/api/admin/users/${userId}/toggle-block`, {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to block/unblock user");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Success",
        description: "User status updated successfully",
      });
      setBlockUserDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const users = usersData?.users || [];
  
  // Filter users based on search term
  const filteredUsers = users.filter(user => 
    user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const userRoleBadge = (role: string) => {
    switch(role) {
      case "admin":
        return <Badge className="bg-purple-100 text-purple-800">Admin</Badge>;
      case "moderator":
        return <Badge className="bg-blue-100 text-blue-800">Moderator</Badge>;
      default:
        return <Badge className="bg-slate-100 text-slate-800">User</Badge>;
    }
  };

  const viewUserDetails = (user: UserType) => {
    setSelectedUser(user);
    setViewUserDialogOpen(true);
  };

  const handleBlockUser = (user: UserType) => {
    setSelectedUser(user);
    setBlockUserDialogOpen(true);
  };

  const confirmBlockUser = () => {
    if (selectedUser) {
      blockUserMutation.mutate(selectedUser.id);
    }
  };

  return (
    <AdminLayout title="User Management">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-semibold">User Management</h2>
          <p className="text-muted-foreground">View and manage all users in the platform</p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              className="pl-8 w-[250px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Button>
            <UserCog className="mr-2 h-4 w-4" />
            Add New User
          </Button>
        </div>
      </div>
      
      <div className="grid gap-6 mb-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingStats ? "..." : statsData?.total}
            </div>
            <p className="text-xs text-muted-foreground">
              +{statsData?.newLastWeek || 0} from last week
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingStats ? "..." : statsData?.active}
            </div>
            <p className="text-xs text-muted-foreground">
              {Math.round((statsData?.active || 0) / (statsData?.total || 1) * 100)}% of total users
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">New Users</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingStats ? "..." : statsData?.newLastWeek}
            </div>
            <p className="text-xs text-muted-foreground">Last 7 days</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Admins</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingStats ? "..." : statsData?.admins}
            </div>
            <p className="text-xs text-muted-foreground">System administrators</p>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingUsers ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-24 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-24 text-center">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.fullName}</TableCell>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phoneNumber || "N/A"}</TableCell>
                    <TableCell>{userRoleBadge(user.role || "user")}</TableCell>
                    <TableCell>
                      <Badge variant={user.isActive ? "default" : "destructive"}>
                        {user.isActive ? "Active" : "Blocked"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.lastActive ? format(new Date(user.lastActive), "MMM d, yyyy") : "Never"}
                    </TableCell>
                    <TableCell>{format(new Date(user.createdAt), "MMM d, yyyy")}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => viewUserDetails(user)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit User
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Mail className="mr-2 h-4 w-4" />
                            Send Email
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive" 
                            onClick={() => handleBlockUser(user)}
                          >
                            {user.isActive ? (
                              <>
                                <UserX className="mr-2 h-4 w-4" />
                                Block User
                              </>
                            ) : (
                              <>
                                <UserCheck className="mr-2 h-4 w-4" />
                                Unblock User
                              </>
                            )}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View User Details Dialog */}
      <Dialog open={viewUserDialogOpen} onOpenChange={setViewUserDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              Detailed information about the selected user.
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <h4 className="font-medium">Personal Information</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-muted-foreground">Full Name</div>
                  <div>{selectedUser.fullName}</div>
                  <div className="text-muted-foreground">Username</div>
                  <div>{selectedUser.username}</div>
                  <div className="text-muted-foreground">Email</div>
                  <div>{selectedUser.email}</div>
                  <div className="text-muted-foreground">Phone</div>
                  <div>{selectedUser.phoneNumber || "N/A"}</div>
                  <div className="text-muted-foreground">Location</div>
                  <div>{selectedUser.location || "N/A"}</div>
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Account Information</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-muted-foreground">Role</div>
                  <div>{userRoleBadge(selectedUser.role || "user")}</div>
                  <div className="text-muted-foreground">Status</div>
                  <div>
                    <Badge variant={selectedUser.isActive ? "default" : "destructive"}>
                      {selectedUser.isActive ? "Active" : "Blocked"}
                    </Badge>
                  </div>
                  <div className="text-muted-foreground">Last Active</div>
                  <div>
                    {selectedUser.lastActive 
                      ? format(new Date(selectedUser.lastActive), "PPP")
                      : "Never"}
                  </div>
                  <div className="text-muted-foreground">Joined</div>
                  <div>{format(new Date(selectedUser.createdAt), "PPP")}</div>
                </div>
              </div>
              {activityData && (
                <>
                  <div className="space-y-2">
                    <h4 className="font-medium">Recent Activity</h4>
                    <div className="space-y-4">
                      {activityData.transactions.length > 0 && (
                        <div>
                          <h5 className="text-sm font-medium mb-2">Recent Transactions</h5>
                          <div className="space-y-1">
                            {activityData.transactions.map((tx: any) => (
                              <div key={tx.id} className="text-sm flex justify-between">
                                <span>{tx.type}</span>
                                <span>{tx.amount} KES</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {activityData.messages.length > 0 && (
                        <div>
                          <h5 className="text-sm font-medium mb-2">Recent Messages</h5>
                          <div className="space-y-1">
                            {activityData.messages.map((msg: any) => (
                              <div key={msg.id} className="text-sm">
                                {msg.content.substring(0, 50)}...
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {activityData.chamas.length > 0 && (
                        <div>
                          <h5 className="text-sm font-medium mb-2">Chama Memberships</h5>
                          <div className="space-y-1">
                            {activityData.chamas.map((chama: any) => (
                              <div key={chama.id} className="text-sm flex justify-between">
                                <span>{chama.name}</span>
                                <Badge variant="outline">{chama.role}</Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Block User Confirmation Dialog */}
      <AlertDialog open={blockUserDialogOpen} onOpenChange={setBlockUserDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {selectedUser?.isActive ? "Block User" : "Unblock User"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {selectedUser?.isActive
                ? "Are you sure you want to block this user? They will not be able to access their account until unblocked."
                : "Are you sure you want to unblock this user? They will regain access to their account."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmBlockUser}
              className={selectedUser?.isActive ? "bg-destructive" : ""}
            >
              {selectedUser?.isActive ? "Block" : "Unblock"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}