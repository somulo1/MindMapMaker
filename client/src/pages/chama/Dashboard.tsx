import { useState } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { formatDistanceToNow } from "date-fns";
import ChamaLayout from "@/components/layout/ChamaLayout";
import StatCard from "@/components/dashboard/StatCard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  PiggyBank,
  Users,
  Calendar as CalendarIcon,
  TrendingUp,
  BarChart4,
  Clock,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Edit3,
  Loader2
} from "lucide-react";
import { Chama, Contribution, ChamaMemberWithUser, Meeting } from "@shared/schema";
import { getChama, getChamaMembers, getChamaContributions, getChamaMeetings } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { cn } from "@/lib/utils";

// Form schemas
const meetingSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  date: z.date(),
  time: z.string().min(1, "Time is required"),
  location: z.string().min(1, "Location is required"),
  agenda: z.string().min(1, "Agenda is required"),
});

type MeetingFormValues = z.infer<typeof meetingSchema>;
type CreateMeetingData = {
  title: string;
  description: string;
  location: string;
  agenda: string;
  scheduledFor: string;
};

interface ChamaDashboardProps {
  id?: string;
}

export default function ChamaDashboard({ id: propId }: ChamaDashboardProps = {}) {
  const params = useParams<{ id: string }>();
  const chamaId = parseInt(propId || params?.id || '0');
  const { toast } = useToast();
  const [openNewMeetingDialog, setOpenNewMeetingDialog] = useState(false);
  
  const { data: chama, isLoading: isChamaLoading } = useQuery<Chama>({
    queryKey: [`/api/chamas/${chamaId}`],
    enabled: !isNaN(chamaId) && chamaId > 0,
    queryFn: async () => {
      const response = await getChama(chamaId);
      return response;
    }
  });

  const { data: members = [], isLoading: isMembersLoading } = useQuery<ChamaMemberWithUser[]>({
    queryKey: [`/api/chamas/${chamaId}/members`],
    enabled: !isNaN(chamaId) && chamaId > 0,
    queryFn: async () => {
      const response = await getChamaMembers(chamaId);
      return response;
    }
  });

  const { data: contributions = [], isLoading: isContributionsLoading } = useQuery<Contribution[]>({
    queryKey: [`/api/chamas/${chamaId}/contributions`],
    enabled: !isNaN(chamaId) && chamaId > 0,
    queryFn: async () => {
      const response = await getChamaContributions(chamaId);
      return response;
    }
  });

  const { data: meetings = [], isLoading: isMeetingsLoading } = useQuery<Meeting[]>({
    queryKey: [`/api/chamas/${chamaId}/meetings`],
    enabled: !isNaN(chamaId) && chamaId > 0,
    queryFn: async () => {
      try {
        const response = await getChamaMeetings(chamaId);
        // Sort meetings by scheduled date
        return (response || []).sort((a: any, b: any) => 
          new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime()
        );
      } catch (error) {
        console.error('Error fetching meetings:', error);
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : 'Failed to fetch meetings',
          variant: "destructive",
        });
        return [];
      }
    },
    // Refetch every minute to keep meetings up to date
    refetchInterval: 60 * 1000,
    // Allow background updates
    staleTime: 30 * 1000,
    // Ensure we get fresh data when the component mounts
    refetchOnMount: true
  });

  // Filter upcoming meetings and sort by date
  const upcomingMeetings = meetings
    .filter(meeting => {
      const meetingDate = new Date(meeting.scheduledFor);
      // Only show meetings that haven't started yet
      return meetingDate > new Date() && meeting.status === "upcoming";
    })
    .sort((a, b) => new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime());

  // Get the next meeting (closest upcoming meeting)
  const nextMeeting = upcomingMeetings.length > 0 ? upcomingMeetings[0] : null;

  // Meeting form
  const meetingForm = useForm<MeetingFormValues>({
    resolver: zodResolver(meetingSchema),
    defaultValues: {
      title: "",
      description: "",
      date: new Date(),
      time: "",
      location: "",
      agenda: "",
    },
  });

  // Meeting mutation
  const createMeetingMutation = useMutation({
    mutationFn: async (data: CreateMeetingData) => {
      const response = await fetch(`/api/chamas/${chamaId}/meetings`, {
        method: 'POST',
        credentials: 'include',
        headers: { 
          'Accept': 'application/json',
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create meeting');
      }
      return response.json();
    },
    onSuccess: () => {
      // Invalidate both the meetings list and any specific meeting queries
      queryClient.invalidateQueries({ queryKey: [`/api/chamas/${chamaId}/meetings`] });
      toast({
        title: "Meeting scheduled",
        description: "The meeting has been successfully scheduled.",
      });
      setOpenNewMeetingDialog(false);
      meetingForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to schedule meeting",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onNewMeetingSubmit = (data: MeetingFormValues) => {
    // Format the date and time into ISO string
    const scheduledDateTime = new Date(
      data.date.getFullYear(),
      data.date.getMonth(),
      data.date.getDate(),
      ...data.time.split(':').map(Number)
    ).toISOString();

    const meetingData: CreateMeetingData = {
      title: data.title,
      description: data.description,
      location: data.location,
      agenda: data.agenda,
      scheduledFor: scheduledDateTime
    };

    createMeetingMutation.mutate(meetingData);
  };

  if (isChamaLoading || isMembersLoading || isContributionsLoading || isMeetingsLoading) {
    return (
      <ChamaLayout>
        <div className="animate-pulse space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-32 bg-muted rounded-lg"></div>
            <div className="h-32 bg-muted rounded-lg"></div>
            <div className="h-32 bg-muted rounded-lg"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-64 bg-muted rounded-lg"></div>
            <div className="h-64 bg-muted rounded-lg"></div>
          </div>
        </div>
      </ChamaLayout>
    );
  }

  if (!chama) {
    return (
      <ChamaLayout>
        <div className="text-center py-8">
          <h2 className="text-2xl font-bold text-destructive">Chama not found</h2>
          <p className="text-muted-foreground mt-2">The chama you're looking for doesn't exist or you don't have access to it.</p>
        </div>
      </ChamaLayout>
    );
  }

  // Calculate chama statistics
  const totalMembers = members.length;
  
  const totalContributions = contributions?.reduce((sum, contrib) => {
    if (contrib.status === 'paid') {
      return sum + parseFloat(contrib.amount.toString());
    }
    return sum;
  }, 0) || 0;
  
  const pendingContributions = contributions?.reduce((sum, contrib) => {
    if (contrib.status === 'pending') {
      return sum + parseFloat(contrib.amount.toString());
    }
    return sum;
  }, 0) || 0;
  
  const overdueContributions = contributions?.reduce((sum, contrib) => {
    if (contrib.status === 'overdue') {
      return sum + parseFloat(contrib.amount.toString());
    }
    return sum;
  }, 0) || 0;

  // Mock data for investments and distributions
  const investmentData = [
    { name: "Real Estate", amount: 150000, percentage: 45 },
    { name: "Business Loans", amount: 100000, percentage: 30 },
    { name: "Fixed Deposit", amount: 50000, percentage: 15 },
    { name: "Emergency Fund", amount: 33000, percentage: 10 },
  ];

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <ChamaLayout>
      {/* Overview Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Group Balance"
          value={`KES ${totalContributions.toLocaleString()}`}
          icon={PiggyBank}
          trend={{ value: "12% from last month", isPositive: true }}
        />
        
        <StatCard
          title="Total Members"
          value={totalMembers.toString()}
          icon={Users}
          iconClassName="text-secondary"
          footer={
            <div className="w-full">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Active members</span>
                <span className="text-primary font-medium">{totalMembers}</span>
              </div>
              <Progress value={100} className="h-2" />
            </div>
          }
        />
        
        <StatCard
          title="Next Meeting"
          value={nextMeeting 
            ? nextMeeting.title
            : "No upcoming meetings"}
          icon={CalendarIcon}
          iconClassName="text-accent"
          footer={
            nextMeeting ? (
              <div className="flex flex-col w-full gap-1">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(nextMeeting.scheduledFor), "MMMM d, yyyy 'at' h:mm a")}
                  </span>
                  <Badge variant="outline" className="ml-2">
                    {formatDistanceToNow(new Date(nextMeeting.scheduledFor), { addSuffix: true })}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">{nextMeeting.location}</span>
                  <Button variant="link" size="sm" className="text-primary p-0" asChild>
                    <a href={`/chamas/${chamaId}/meetings`}>View Details</a>
                  </Button>
                </div>
              </div>
            ) : (
              <Button variant="outline" size="sm" className="w-full" onClick={() => setOpenNewMeetingDialog(true)}>
                Schedule Meeting
              </Button>
            )
          }
        />
      </div>
      
      {/* Contributions Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Contributions Overview</CardTitle>
            <CardDescription>
              Summary of all member contributions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="rounded-lg bg-muted p-3">
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Total Collected</h4>
                <p className="text-xl font-bold">KES {totalContributions.toLocaleString()}</p>
              </div>
              
              <div className="rounded-lg bg-muted p-3">
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Pending</h4>
                <p className="text-xl font-bold text-warning">KES {pendingContributions.toLocaleString()}</p>
              </div>
              
              <div className="rounded-lg bg-muted p-3">
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Overdue</h4>
                <p className="text-xl font-bold text-destructive">KES {overdueContributions.toLocaleString()}</p>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-2">Contribution Status</h4>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>Paid</span>
                    <span>{Math.round((totalContributions / (totalContributions + pendingContributions + overdueContributions)) * 100)}%</span>
                  </div>
                  <Progress value={(totalContributions / (totalContributions + pendingContributions + overdueContributions)) * 100} className="h-2 bg-muted" />
                </div>
                
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>Pending</span>
                    <span>{Math.round((pendingContributions / (totalContributions + pendingContributions + overdueContributions)) * 100)}%</span>
                  </div>
                  <Progress value={(pendingContributions / (totalContributions + pendingContributions + overdueContributions)) * 100} className="h-2 bg-muted" />
                </div>
                
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>Overdue</span>
                    <span>{Math.round((overdueContributions / (totalContributions + pendingContributions + overdueContributions)) * 100)}%</span>
                  </div>
                  <Progress value={(overdueContributions / (totalContributions + pendingContributions + overdueContributions)) * 100} className="h-2 bg-muted" />
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" asChild>
              <a href={`/chamas/${chamaId}/contributions`}>
                <BarChart4 className="mr-2 h-4 w-4" />
                View All Contributions
              </a>
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Investment Allocations</CardTitle>
            <CardDescription>
              How the group funds are allocated
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {investmentData.map((item, index) => (
                <div key={index}>
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center">
                      <span className="font-medium">{item.name}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm font-medium">KES {item.amount.toLocaleString()}</span>
                      <Badge variant="outline" className="ml-2">{item.percentage}%</Badge>
                    </div>
                  </div>
                  <Progress value={item.percentage} className="h-2" />
                </div>
              ))}
            </div>
            
            <div className="mt-6">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-sm font-medium">Growth Projection</h4>
                <Badge variant="outline" className="bg-success/10 text-success border-success">+12.5% Annual</Badge>
              </div>
              <div className="rounded-lg bg-muted p-3">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-muted-foreground">Current Value</p>
                    <p className="text-lg font-bold">KES 333,000</p>
                  </div>
                  <ArrowRight className="h-4 w-4" />
                  <div>
                    <p className="text-sm text-muted-foreground">Projected EOY</p>
                    <p className="text-lg font-bold text-success">KES 374,625</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">
              <TrendingUp className="mr-2 h-4 w-4" />
              View Investment Reports
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      {/* Members & Meetings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-lg">Active Members</CardTitle>
                <CardDescription>
                  {totalMembers} total members
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <a href={`/chamas/${chamaId}/members`}>View All</a>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {members.slice(0, 5).map((member: any) => {
                if (!member?.user) return null;
                
                return (
                <div key={member.id} className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Avatar className="h-9 w-9 mr-2">
                        <AvatarImage src={member.user.profilePic || ""} alt={member.user.fullName} />
                      <AvatarFallback>{getInitials(member.user.fullName)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{member.user.fullName}</p>
                      <p className="text-xs text-muted-foreground">{member.role}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className={
                    member.role === "chairperson" ? "bg-success/10 text-success border-success" :
                    member.role === "treasurer" ? "bg-info/10 text-info border-info" :
                    member.role === "secretary" ? "bg-info/10 text-info border-info" :
                    "bg-secondary/50"
                  }>
                    {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                  </Badge>
                </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-lg">Upcoming Meetings</CardTitle>
                <CardDescription>
                  Next {upcomingMeetings.length} scheduled meetings
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => setOpenNewMeetingDialog(true)}>
                <CalendarIcon className="h-4 w-4 mr-2" />
                Schedule
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {upcomingMeetings.length === 0 ? (
              <div className="text-center py-8">
                <CalendarIcon className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <h3 className="font-medium mb-1">No Upcoming Meetings</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  There are no meetings scheduled. Click below to schedule one.
                </p>
                <Button onClick={() => setOpenNewMeetingDialog(true)}>
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  Schedule a Meeting
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingMeetings.slice(0, 3).map((meeting) => (
                  <div key={meeting.id} className="rounded-lg border p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium">{meeting.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(meeting.scheduledFor), "MMMM d, yyyy 'at' h:mm a")}
                        </p>
                      </div>
                      <Badge variant="outline">
                        {formatDistanceToNow(new Date(meeting.scheduledFor), { addSuffix: true })}
                      </Badge>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <h5 className="text-sm font-medium mb-1">Description</h5>
                        <p className="text-sm text-muted-foreground">{meeting.description}</p>
                      </div>
                      <div>
                        <h5 className="text-sm font-medium mb-1">Location</h5>
                        <p className="text-sm text-muted-foreground">{meeting.location}</p>
                      </div>
                      {meeting.agenda && (
                        <div>
                          <h5 className="text-sm font-medium mb-1">Agenda</h5>
                          <p className="text-sm text-muted-foreground">{meeting.agenda}</p>
                        </div>
                      )}
                    </div>
                    <div className="flex justify-end mt-4">
                      <Button variant="link" size="sm" className="p-0" asChild>
                        <a href={`/chamas/${chamaId}/meetings`}>View Details</a>
                      </Button>
                    </div>
                  </div>
                ))}
                {upcomingMeetings.length > 3 && (
                  <div className="flex justify-center">
                    <Button variant="link" asChild>
                      <a href={`/chamas/${chamaId}/meetings`}>
                        View All Meetings ({upcomingMeetings.length})
                      </a>
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Action Items */}
      <div className="mb-8">
        <h3 className="text-lg font-medium mb-4">Action Items</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-warning/50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="bg-warning/10 rounded-full p-2">
                  <AlertTriangle className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <h4 className="font-medium mb-1">Pending Contributions</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    5 members have pending contributions totaling KES {pendingContributions.toLocaleString()}
                  </p>
                  <Button size="sm">Send Reminders</Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-info/50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="bg-info/10 rounded-full p-2">
                  <Edit3 className="h-5 w-5 text-info" />
                </div>
                <div>
                  <h4 className="font-medium mb-1">Meeting Minutes Pending</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Minutes from the last meeting need to be uploaded and shared
                  </p>
                  <Button size="sm">Upload Minutes</Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-success/50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="bg-success/10 rounded-full p-2">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                </div>
                <div>
                  <h4 className="font-medium mb-1">Quarterly Report Ready</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    The Q2 2023 financial report is ready for review
                  </p>
                  <Button size="sm">View Report</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* New Meeting Dialog */}
      <Dialog open={openNewMeetingDialog} onOpenChange={setOpenNewMeetingDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule New Meeting</DialogTitle>
            <DialogDescription>
              Schedule a new meeting for your chama members.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...meetingForm}>
            <form onSubmit={meetingForm.handleSubmit(onNewMeetingSubmit)} className="space-y-4">
              <FormField
                control={meetingForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={meetingForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={meetingForm.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date < new Date()
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={meetingForm.control}
                  name="time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={meetingForm.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={meetingForm.control}
                name="agenda"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Agenda</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpenNewMeetingDialog(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={createMeetingMutation.isPending}
                >
                  {createMeetingMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Scheduling...
                    </>
                  ) : (
                    <>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      Schedule Meeting
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </ChamaLayout>
  );
}
