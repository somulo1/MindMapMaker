import { X, BellRing, AlertCircle, CreditCard, Users, Check, X as XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ChamaInvitation } from "@shared/schema";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { useNotifications } from "@/context/NotificationContext";
import { useEffect, useRef, useState } from "react";

type InvitationWithDetails = {
  id: number;
  chamaId: number;
  role: string;
  status: string;
  invitedAt: string;
  chama: {
    id: number;
    name: string;
    icon: string;
    iconBg: string;
  };
  invitedByUser: {
    id: number;
    fullName: string;
  };
};

export default function NotificationPanel() {
  const { toast } = useToast();
  const { isOpen, closeNotifications } = useNotifications();
  const panelRef = useRef<HTMLDivElement>(null);
  const [processingInvitations, setProcessingInvitations] = useState<number[]>([]);

  // Fetch invitations with real-time updates
  const { data: invitationsResponse, isLoading, error } = useQuery<{ invitations: InvitationWithDetails[] }>({
    queryKey: ['/api/chamas/invitations/user'],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/invitations");
      const data = await response.json();
      return data;
    },
    // Poll every 10 seconds for new invitations
    refetchInterval: 10000,
    // Keep polling even when the window is not focused
    refetchIntervalInBackground: true,
    // Refetch when the window regains focus
    refetchOnWindowFocus: true,
  });

  const invitations = invitationsResponse?.invitations || [];

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

  // Handle invitation response (accept/reject)
  const handleInvitationResponse = useMutation({
    mutationFn: async ({ invitationId, accept }: { invitationId: number; accept: boolean }) => {
      try {
        setProcessingInvitations(prev => [...prev, invitationId]);

        // First update the invitation status
        const response = await apiRequest(
          "POST", 
          `/api/chamas/invitations/${invitationId}/${accept ? 'accept' : 'reject'}`
        );
        
        if (!response.ok) {
          throw new Error('Failed to update invitation status');
        }
        
        const data = await response.json();

        // If accepted, add user to chama
        if (accept) {
          const invitation = invitations.find(inv => inv.id === invitationId);
          if (invitation) {
            const memberResponse = await apiRequest(
              "POST",
              `/api/chamas/${invitation.chamaId}/members`,
              {
                role: invitation.role
              }
            );
            
            if (!memberResponse.ok) {
              throw new Error('Failed to add member to chama');
            }
          }
        }

        // Wait for 2 seconds before deleting the invitation
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Delete the invitation since it's been handled
        const deleteResponse = await apiRequest(
          "DELETE",
          `/api/chamas/invitations/${invitationId}`
        );

        if (!deleteResponse.ok) {
          throw new Error('Failed to delete invitation');
        }

        return data;
      } finally {
        setProcessingInvitations(prev => prev.filter(id => id !== invitationId));
      }
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({ queryKey: ["/api/chamas/invitations/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/chamas"] }); 
      
      toast({
        title: variables.accept ? "Invitation Accepted" : "Invitation Declined",
        description: variables.accept 
          ? "You have successfully joined the chama group." 
          : "You have declined the invitation.",
        duration: 3000, // Show toast for 3 seconds
      });

      // Check remaining invitations after a delay
      setTimeout(() => {
        const remainingInvitations = invitations.filter(inv => 
          inv.id !== data.invitationId && inv.status === "pending"
        );
        if (remainingInvitations.length === 0) {
          closeNotifications();
        }
      }, 2500); // Wait 2.5 seconds before checking and potentially closing
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to process invitation response. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    },
  });

  const formatTime = (timestamp: string | Date | number | null) => {
    if (!timestamp) return "some time ago";
    try {
      const date = typeof timestamp === 'string' ? new Date(timestamp) : 
                   typeof timestamp === 'number' ? new Date(timestamp) :
                   timestamp;
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (e) {
      return "some time ago";
    }
  };

  const renderInvitationActions = (invitation: InvitationWithDetails) => {
    if (invitation.status === "pending") {
      const isProcessing = processingInvitations.includes(invitation.id);
      return (
        <div className="flex gap-2 mt-2">
          <Button
            size="sm"
            className="w-full"
            onClick={(e) => {
              e.stopPropagation();
              handleInvitationResponse.mutate({ invitationId: invitation.id, accept: true });
            }}
            disabled={isProcessing || handleInvitationResponse.isPending}
          >
            {isProcessing ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1" />
            ) : (
              <Check className="h-4 w-4 mr-1" />
            )}
            {isProcessing ? 'Processing...' : 'Accept'}
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="w-full"
            onClick={(e) => {
              e.stopPropagation();
              handleInvitationResponse.mutate({ invitationId: invitation.id, accept: false });
            }}
            disabled={isProcessing || handleInvitationResponse.isPending}
          >
            {isProcessing ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-1" />
            ) : (
              <XIcon className="h-4 w-4 mr-1" />
            )}
            {isProcessing ? 'Processing...' : 'Decline'}
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

  if (!isOpen) return null;

  // Filter out non-pending invitations
  const pendingInvitations = invitations.filter(inv => inv.status === "pending");

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/20 z-20" 
        onClick={closeNotifications}
      />
      <div className={panelClasses} ref={panelRef}>
        <div className="h-full flex flex-col">
          <div className="p-4 border-b border-border flex justify-between items-center">
            <h3 className="text-lg font-medium">Invitations</h3>
            <Button variant="ghost" size="icon" onClick={closeNotifications}>
              <X className="h-5 w-5" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
          
          <ScrollArea className="flex-1">
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center h-32 p-4">
                <AlertCircle className="h-8 w-8 text-destructive mb-2" />
                <p className="text-sm text-muted-foreground">Failed to load invitations</p>
              </div>
            ) : pendingInvitations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 p-4">
                <Users className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No pending invitations</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {pendingInvitations.map((invitation) => (
                  <div 
                    key={invitation.id} 
                    className="p-4 hover:bg-muted/50 cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      <Users className="text-primary p-2 bg-primary/10 rounded-full" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          Invitation to join {invitation.chama.name}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Invited by {invitation.invitedByUser.fullName} as {invitation.role}
                        </p>
                        <p className="text-xs text-muted-foreground/60 mt-2">
                          {formatTime(invitation.invitedAt)}
                        </p>
                        {renderInvitationActions(invitation)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </div>
    </>
  );
}
