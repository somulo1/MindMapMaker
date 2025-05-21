import { X, BellRing, AlertCircle, CreditCard, Users, Check, X as XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMutation } from "@tanstack/react-query";
import { Notification } from "@shared/schema";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { useNotifications } from "@/context/NotificationContext";
import { useEffect, useRef } from "react";

export default function NotificationPanel() {
  const { toast } = useToast();
  const { isOpen, closeNotifications, notifications = [] } = useNotifications();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        closeNotifications();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, closeNotifications]);

  const markAsReadMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("POST", `/api/notifications/${id}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to mark notification as read",
        variant: "destructive",
      });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const promises = notifications
        .filter(notification => !notification.read)
        .map(notification => markAsReadMutation.mutateAsync(notification.id));
      await Promise.all(promises);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "All notifications marked as read",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
  });

  const handleInvitationResponse = useMutation({
    mutationFn: async ({ invitationId, accept }: { invitationId: number; accept: boolean }) => {
      return apiRequest(
        "POST", 
        `/api/chama-invitations/${invitationId}/${accept ? 'accept' : 'reject'}`
      );
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      toast({
        title: variables.accept ? "Invitation Accepted" : "Invitation Declined",
        description: variables.accept 
          ? "You have successfully joined the chama group." 
          : "You have declined the invitation.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to process the invitation response",
        variant: "destructive",
      });
    },
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "chama_invitation":
        return <Users className="text-primary p-2 bg-primary/10 rounded-full" />;
      case "meeting_scheduled":
        return <Users className="text-info p-2 bg-info/10 rounded-full" />;
      case "contribution_due":
        return <CreditCard className="text-warning p-2 bg-warning/10 rounded-full" />;
      case "payment_received":
        return <CreditCard className="text-success p-2 bg-success/10 rounded-full" />;
      default:
        return <BellRing className="text-primary p-2 bg-primary/10 rounded-full" />;
    }
  };

  const formatTime = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (e) {
      return "some time ago";
    }
  };

  const renderNotificationActions = (notification: Notification) => {
    if (notification.type === "chama_invitation" && !notification.read) {
      const invitationId = notification.relatedId;
      if (!invitationId) return null;

      return (
        <div className="flex gap-2 mt-2">
          <Button
            size="sm"
            className="w-full"
            onClick={() => handleInvitationResponse.mutate({ invitationId, accept: true })}
            disabled={handleInvitationResponse.isPending}
          >
            <Check className="h-4 w-4 mr-1" />
            Accept
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="w-full"
            onClick={() => handleInvitationResponse.mutate({ invitationId, accept: false })}
            disabled={handleInvitationResponse.isPending}
          >
            <XIcon className="h-4 w-4 mr-1" />
            Decline
          </Button>
        </div>
      );
    }
    return null;
  };

  const panelClasses = `
    fixed inset-y-0 right-0 max-w-xs w-full bg-white shadow-lg z-30 
    transform transition-transform duration-300 ease-in-out
    ${isOpen ? 'translate-x-0' : 'translate-x-full'}
  `;

  return (
    <div className={panelClasses} ref={panelRef}>
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-border flex justify-between items-center">
          <h3 className="text-lg font-medium">Notifications</h3>
          <Button variant="ghost" size="icon" onClick={closeNotifications}>
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </Button>
        </div>
        
        <ScrollArea className="flex-1">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 p-4">
              <BellRing className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`p-4 hover:bg-muted/50 ${notification.read ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    {getNotificationIcon(notification.type)}
                    <div className="flex-1">
                      <p className="text-sm font-medium">{notification.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{notification.content}</p>
                      <p className="text-xs text-muted-foreground/60 mt-2">
                        {notification.createdAt ? formatTime(notification.createdAt.toString()) : 'Unknown time'}
                      </p>
                      {renderNotificationActions(notification)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        
        {notifications.length > 0 && (
          <div className="p-4 border-t border-border">
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => markAllAsReadMutation.mutate()}
              disabled={markAllAsReadMutation.isPending || notifications.every(n => n.read)}
            >
              Mark All as Read
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
