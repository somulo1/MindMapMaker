import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ChamaMemberWithUser } from '@shared/schema';
import { updateMemberRating } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, StarHalf } from 'lucide-react';

interface MemberDetailsProps {
  member: ChamaMemberWithUser;
  chamaId: number;
  isOpen: boolean;
  onClose: () => void;
}

export function MemberDetails({ member, chamaId, isOpen, onClose }: MemberDetailsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateRatingMutation = useMutation({
    mutationFn: (rating: number) => updateMemberRating(chamaId, member.id, rating),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/chamas/${chamaId}/members`] });
      toast({
        title: "Rating updated",
        description: "Member rating has been updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update rating",
        variant: "destructive",
      });
    },
  });

  const handleRatingClick = (rating: number) => {
    updateRatingMutation.mutate(rating);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Member Details</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={member.user?.profilePic} />
              <AvatarFallback>
                {member.user?.fullName?.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">{member.user?.fullName}</h3>
              <p className="text-sm text-gray-500">{member.role}</p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Contact Information</p>
            <div className="text-sm">
              <p>Email: {member.user?.email}</p>
              <p>Phone: {member.user?.phoneNumber || 'Not provided'}</p>
              <p>Location: {member.user?.location || 'Not provided'}</p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Contribution Details</p>
            <div className="text-sm">
              <p>Amount: {member.contributionAmount || 'Not set'}</p>
              <p>Frequency: {member.contributionFrequency || 'Not set'}</p>
              <p>Member since: {new Date(member.joinedAt).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Rating</p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((rating) => (
                <Button
                  key={rating}
                  variant="ghost"
                  size="sm"
                  className={`p-1 ${member.rating >= rating ? 'text-yellow-500' : 'text-gray-300'}`}
                  onClick={() => handleRatingClick(rating)}
                  disabled={updateRatingMutation.isPending}
                >
                  <Star className="h-5 w-5" />
                </Button>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 