import { useState } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import ChamaLayout from "@/components/layout/ChamaLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Search,
  UserPlus,
  Send,
  MoreHorizontal,
  Mail,
  Phone,
  ChevronDown,
  CheckCircle2,
  ShieldAlert,
  Calendar,
  AlertCircle,
  Loader2,
  Users,
  BarChart4,
  Star
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { getChamaMembers, addChamaMember } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { ChamaMember, ChamaInvitation, User } from "@shared/schema";
import { MemberDetails } from "@/components/chama/MemberDetails";

// Form schema for adding a new member
const addMemberSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  role: z.string().min(1, { message: "Please select a role" }),
});

type AddMemberFormValues = z.infer<typeof addMemberSchema>;

// Extended types for API responses
type ChamaMemberWithUser = ChamaMember & {
  user: Pick<User, "id" | "username" | "fullName" | "email" | "profilePic" | "location" | "phoneNumber">;
  rating?: number | null;
};

type ChamaInvitationWithUser = {
  id: number;
  chamaId: number;
  role: string;
  invitedUserId: number;
  invitedByUserId: number;
  status: string;
  invitedAt: Date;
  respondedAt: Date | null;
  invitedUser: Pick<User, "id" | "username" | "fullName" | "email" | "profilePic">;
  invitedByUser: Pick<User, "id" | "username" | "fullName">;
};

type ChamaMembersResponse = {
  members: ChamaMemberWithUser[];
};

type ChamaInvitationsResponse = {
  invitations: ChamaInvitationWithUser[];
};

interface AddMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chamaId: number;
}

function AddMemberDialog({ open, onOpenChange, chamaId }: AddMemberDialogProps) {
  const { toast } = useToast();
  const form = useForm<AddMemberFormValues>({
    resolver: zodResolver(addMemberSchema),
    defaultValues: {
      email: "",
      role: "member",
    },
  });

  const inviteMemberMutation = useMutation({
    mutationFn: async (data: AddMemberFormValues) => {
      return apiRequest("POST", `/api/chamas/${chamaId}/invitations`, {
        email: data.email,
        role: data.role
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/chamas/${chamaId}/invitations`] });
      toast({
        title: "Invitation sent",
        description: "The invitation has been sent successfully.",
      });
      onOpenChange(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Failed to send invitation",
        description: error instanceof Error ? error.message : "Failed to send invitation",
        variant: "destructive",
      });
    },
  });

  function onSubmit(data: AddMemberFormValues) {
    inviteMemberMutation.mutate(data);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Member</DialogTitle>
          <DialogDescription>
            Send an invitation to add a new member to the chama.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="member@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="secretary">Secretary</SelectItem>
                      <SelectItem value="treasurer">Treasurer</SelectItem>
                      <SelectItem value="chairperson">Chairperson</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="submit"
                disabled={inviteMemberMutation.isPending}
              >
                {inviteMemberMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Send Invitation
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default function ChamaMembers() {
  const { id } = useParams<{ id: string }>();
  const chamaId = parseInt(id || '');
  const isValidChamaId = !isNaN(chamaId) && chamaId > 0;
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [openAddMemberDialog, setOpenAddMemberDialog] = useState(false);
  const [selectedMember, setSelectedMember] = useState<ChamaMemberWithUser | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  
  const { data: members = [], isLoading, error } = useQuery<ChamaMemberWithUser[]>({
    queryKey: [`/api/chamas/${chamaId}/members`],
    queryFn: async () => {
      try {
        if (!isValidChamaId) {
          throw new Error("Invalid chama ID");
        }
        const response = await getChamaMembers(chamaId);
        return response || [];
      } catch (err) {
        console.error('Error fetching members:', err);
        toast({
          title: "Error fetching members",
          description: err instanceof Error ? err.message : "Failed to fetch members",
          variant: "destructive",
        });
        return [];
      }
    },
    enabled: isValidChamaId
  });

  const { data: invitationsData = { invitations: [] }, isLoading: isLoadingInvitations } = useQuery<ChamaInvitationsResponse>({
    queryKey: ["chamaInvitations", chamaId],
    queryFn: async () => {
      if (!isValidChamaId) {
        throw new Error("Invalid chama ID");
      }
      const res = await apiRequest("GET", `/api/chamas/${chamaId}/invitations`);
      return res.json();
    },
    enabled: isValidChamaId
  });

  const invitations = invitationsData?.invitations || [];

  // Form for adding new member
  const form = useForm<AddMemberFormValues>({
    resolver: zodResolver(addMemberSchema),
    defaultValues: {
      email: "",
      role: "member",
    },
  });

  // Mutation for inviting a new member
  const inviteMemberMutation = useMutation({
    mutationFn: async (data: AddMemberFormValues) => {
      return apiRequest("POST", `/api/chamas/${chamaId}/invitations`, {
        email: data.email,
        role: data.role
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/chamas/${chamaId}/invitations`] });
      toast({
        title: "Invitation sent",
        description: "The invitation has been sent successfully.",
      });
      setOpenAddMemberDialog(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Failed to send invitation",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Filter members based on search query
  const filteredMembers = members.filter((member) => {
    if (!member?.user) return false;
    
    const name = member.user.fullName?.toLowerCase() || '';
    const email = member.user.email?.toLowerCase() || '';
    const role = member.role?.toLowerCase() || '';
    const query = searchQuery.toLowerCase();
    
    return name.includes(query) || email.includes(query) || role.includes(query);
  });

  const onAddMemberSubmit = (data: AddMemberFormValues) => {
    inviteMemberMutation.mutate(data);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Role badge styling
  const getRoleBadgeStyles = (role: string) => {
    switch (role) {
      case "chairperson":
        return "bg-success text-success-foreground";
      case "treasurer":
      case "secretary":
        return "bg-info text-info-foreground";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  // Contribution stats for member details
  const getMemberContributionStats = (memberId: number) => {
    // In a real app, this would come from API data
    return {
      total: 48000,
      paid: 45000,
      pending: 3000,
      rate: 94,
      timely: true
    };
  };
  
  // Attendance stats for member details
  const getMemberAttendanceStats = (memberId: number) => {
    // In a real app, this would come from API data
    return {
      total: 12,
      attended: 10,
      rate: 83
    };
  };

  const handleMemberClick = (member: ChamaMemberWithUser) => {
    setSelectedMember(member);
    setIsDetailsOpen(true);
  };

  return (
    <ChamaLayout>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Members</h2>
          <Button onClick={() => setOpenAddMemberDialog(true)}>Add Member</Button>
      </div>
      
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {members.map((member) => (
            <Card 
              key={member.id} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleMemberClick(member)}
                    >
              <CardHeader className="flex flex-row items-center gap-4">
                        <Avatar>
                  <AvatarImage src={member.user?.profilePic || undefined} />
                          <AvatarFallback>
                    {member.user?.fullName?.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                  <CardTitle>{member.user?.fullName}</CardTitle>
                  <CardDescription>{member.role}</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((starRating) => (
                    <Star
                      key={starRating}
                      className={`h-4 w-4 ${(member.rating ?? 0) >= starRating ? 'text-yellow-500' : 'text-gray-300'}`}
                    />
                      ))}
                    </div>
                  </CardContent>
                </Card>
                      ))}
                    </div>

        {selectedMember && (
          <MemberDetails
            member={selectedMember}
            chamaId={chamaId}
            isOpen={isDetailsOpen}
            onClose={() => {
              setIsDetailsOpen(false);
              setSelectedMember(null);
            }}
          />
        )}

        <AddMemberDialog
          open={openAddMemberDialog}
          onOpenChange={setOpenAddMemberDialog}
          chamaId={chamaId}
        />
                    </div>
    </ChamaLayout>
  );
}

function DollarSign(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" x2="12" y1="2" y2="22" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}
