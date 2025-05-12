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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Clock, FileText, Send, Upload, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
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

const minutesSchema = z.object({
  meetingId: z.number(),
  content: z.string().min(1, "Minutes content is required"),
  file: z.instanceof(File).optional(),
});

type MeetingFormValues = z.infer<typeof meetingSchema>;
type MinutesFormValues = z.infer<typeof minutesSchema>;

export default function ChamaMeetings() {
  const { id } = useParams<{ id: string }>();
  const chamaId = parseInt(id);
  const { toast } = useToast();
  
  const [openNewMeetingDialog, setOpenNewMeetingDialog] = useState(false);
  const [openUploadMinutesDialog, setOpenUploadMinutesDialog] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<number | null>(null);
  
  // Queries
  const { data: meetings = [], isLoading: isMeetingsLoading } = useQuery({
    queryKey: [`/api/chamas/${chamaId}/meetings`],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/chamas/${chamaId}/meetings`);
        if (!response.ok) {
          throw new Error('Failed to fetch meetings');
        }
        const data = await response.json();
        return data || []; // Ensure we always return an array
      } catch (error) {
        console.error('Error fetching meetings:', error);
        return []; // Return empty array on error
      }
    },
    enabled: !isNaN(chamaId)
  });

  // Mutations
  const createMeetingMutation = useMutation({
    mutationFn: async (data: MeetingFormValues) => {
      const response = await fetch(`/api/chamas/${chamaId}/meetings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create meeting');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/chamas/${chamaId}/meetings`] });
      toast({
        title: "Meeting scheduled",
        description: "The meeting has been successfully scheduled.",
      });
      setOpenNewMeetingDialog(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to schedule meeting",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const sendReminderMutation = useMutation({
    mutationFn: async (meetingId: number) => {
      const response = await fetch(`/api/chamas/${chamaId}/meetings/${meetingId}/remind`, {
        method: 'POST',
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to send reminder');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Reminder sent",
        description: "Meeting reminder has been sent to all members.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to send reminder",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const uploadMinutesMutation = useMutation({
    mutationFn: async (data: MinutesFormValues) => {
      const formData = new FormData();
      formData.append('content', data.content);
      if (data.file) formData.append('file', data.file);

      const response = await fetch(`/api/chamas/${chamaId}/meetings/${data.meetingId}/minutes`, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to upload minutes');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/chamas/${chamaId}/meetings`] });
      toast({
        title: "Minutes uploaded",
        description: "Meeting minutes have been successfully uploaded.",
      });
      setOpenUploadMinutesDialog(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to upload minutes",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Forms
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

  const minutesForm = useForm<MinutesFormValues>({
    resolver: zodResolver(minutesSchema),
    defaultValues: {
      meetingId: 0,
      content: "",
    },
  });

  // Handlers
  const onNewMeetingSubmit = (data: MeetingFormValues) => {
    createMeetingMutation.mutate(data);
  };

  const onUploadMinutesSubmit = (data: MinutesFormValues) => {
    if (selectedMeeting) {
      uploadMinutesMutation.mutate({ ...data, meetingId: selectedMeeting });
    }
  };

  const handleSendReminder = (meetingId: number) => {
    sendReminderMutation.mutate(meetingId);
  };

  const handleUploadMinutes = (meetingId: number) => {
    setSelectedMeeting(meetingId);
    setOpenUploadMinutesDialog(true);
  };

  return (
    <ChamaLayout>
      <div className="mb-6">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
            <h2 className="text-xl font-semibold">Meetings</h2>
            <p className="text-muted-foreground">
              Schedule and manage chama meetings
            </p>
          </div>
          
          <Button onClick={() => setOpenNewMeetingDialog(true)}>
            <CalendarIcon className="h-4 w-4 mr-2" />
            Schedule Meeting
          </Button>
        </div>
        </div>
        
      {/* Meetings List */}
      <div className="grid gap-6">
        {isMeetingsLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : meetings.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <CalendarIcon className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Meetings Scheduled</h3>
              <p className="text-muted-foreground mb-4">
                Schedule your first chama meeting to get started.
              </p>
              <Button onClick={() => setOpenNewMeetingDialog(true)}>
                <CalendarIcon className="h-4 w-4 mr-2" />
                Schedule Meeting
              </Button>
            </CardContent>
          </Card>
        ) : (
          meetings.map((meeting: any) => (
            <Card key={meeting.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{meeting.title}</CardTitle>
                    <CardDescription>
                      {format(new Date(meeting.date), "MMMM d, yyyy")} at {meeting.time}
                    </CardDescription>
                  </div>
                  <Badge variant={meeting.status === "upcoming" ? "default" : "secondary"}>
                    {meeting.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-1">Description</h4>
                    <p className="text-sm text-muted-foreground">{meeting.description}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Location</h4>
                    <p className="text-sm text-muted-foreground">{meeting.location}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Agenda</h4>
                    <p className="text-sm text-muted-foreground">{meeting.agenda}</p>
                  </div>
                  {meeting.minutes && (
                    <div>
                      <h4 className="font-medium mb-1">Minutes</h4>
                      <p className="text-sm text-muted-foreground">{meeting.minutes.content}</p>
                      {meeting.minutes.file && (
                        <Button variant="link" className="p-0 h-auto">
                          <FileText className="h-4 w-4 mr-2" />
                          View Minutes Document
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                {meeting.status === "upcoming" && (
                  <Button
                    variant="outline"
                    onClick={() => handleSendReminder(meeting.id)}
                    disabled={sendReminderMutation.isPending}
                  >
                    {sendReminderMutation.isPending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4 mr-2" />
                    )}
                    Send Reminder
                  </Button>
                )}
                {!meeting.minutes && (
                  <Button
                    variant="outline"
                    onClick={() => handleUploadMinutes(meeting.id)}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Minutes
            </Button>
                )}
              </CardFooter>
            </Card>
          ))
        )}
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

      {/* Upload Minutes Dialog */}
      <Dialog open={openUploadMinutesDialog} onOpenChange={setOpenUploadMinutesDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Meeting Minutes</DialogTitle>
            <DialogDescription>
              Upload the minutes and any supporting documents for the meeting.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...minutesForm}>
            <form onSubmit={minutesForm.handleSubmit(onUploadMinutesSubmit)} className="space-y-4">
              <FormField
                control={minutesForm.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minutes Content</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={minutesForm.control}
                name="file"
                render={({ field: { value, onChange, ...field } }) => (
                  <FormItem>
                    <FormLabel>Supporting Document (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => onChange(e.target.files?.[0])}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                  <Button 
                  type="button"
                    variant="outline" 
                  onClick={() => setOpenUploadMinutesDialog(false)}
                  >
                  Cancel
                  </Button>
                <Button
                  type="submit"
                  disabled={uploadMinutesMutation.isPending}
                >
                  {uploadMinutesMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Minutes
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