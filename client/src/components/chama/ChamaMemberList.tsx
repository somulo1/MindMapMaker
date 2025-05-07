import React from 'react';
import { formatDate } from '@/lib/utils';
import Avatar from '../common/Avatar';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Star, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface ChamaMember {
  id: number;
  chamaId: number;
  userId: number;
  role: string;
  contributionAmount?: number;
  contributionFrequency?: string;
  rating: number;
  isActive: boolean;
  joinedAt: string;
  user?: {
    id: number;
    username: string;
    fullName: string;
    email: string;
    profilePic?: string;
    location?: string;
  };
}

interface ChamaMemberListProps {
  members: ChamaMember[];
}

const ChamaMemberList: React.FC<ChamaMemberListProps> = ({ members }) => {
  const [selectedMember, setSelectedMember] = React.useState<ChamaMember | null>(null);
  
  if (members.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-neutral-500 dark:text-neutral-400">No members in this chama yet.</p>
      </div>
    );
  }
  
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'chairperson':
        return 'bg-primary text-primary-foreground';
      case 'treasurer':
        return 'bg-success text-white';
      case 'secretary':
        return 'bg-info text-white';
      case 'assistant':
        return 'bg-accent text-accent-foreground';
      default:
        return 'bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200';
    }
  };
  
  const getFormattedRole = (role: string) => {
    return role.charAt(0).toUpperCase() + role.slice(1);
  };
  
  const getFrequencyLabel = (frequency?: string) => {
    if (!frequency) return '';
    switch (frequency) {
      case 'weekly':
        return 'per week';
      case 'monthly':
        return 'per month';
      case 'quarterly':
        return 'per quarter';
      case 'annually':
        return 'per year';
      default:
        return frequency;
    }
  };
  
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <Star 
        key={index} 
        className={`h-4 w-4 ${index < rating ? 'text-amber-400 fill-amber-400' : 'text-neutral-300 dark:text-neutral-600'}`} 
      />
    ));
  };
  
  return (
    <>
      <div className="space-y-4">
        {members.map((member) => (
          <Card key={member.id} className="p-4 flex items-center justify-between">
            <div className="flex items-center">
              <Avatar
                src={member.user?.profilePic}
                fallback={(member.user?.fullName || member.user?.username || 'U').substring(0, 2).toUpperCase()}
                size="md"
                className="mr-4"
              />
              
              <div>
                <div className="flex items-center">
                  <h3 className="font-medium">{member.user?.fullName || member.user?.username || `User ${member.userId}`}</h3>
                  <Badge className={`ml-2 ${getRoleBadgeColor(member.role)}`}>
                    {getFormattedRole(member.role)}
                  </Badge>
                </div>
                
                <div className="flex items-center text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                  <span>Joined {formatDate(member.joinedAt)}</span>
                  {member.contributionAmount && (
                    <span className="ml-4">
                      Contributes KES {member.contributionAmount} {getFrequencyLabel(member.contributionFrequency)}
                    </span>
                  )}
                </div>
                
                <div className="flex mt-1">
                  {renderStars(member.rating)}
                </div>
              </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setSelectedMember(member)}>
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem>Message</DropdownMenuItem>
                <DropdownMenuItem>Change Role</DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">Remove Member</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </Card>
        ))}
      </div>
      
      {/* Member Details Dialog */}
      <Dialog open={!!selectedMember} onOpenChange={(open) => !open && setSelectedMember(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Member Details</DialogTitle>
            <DialogDescription>
              Information about this chama member.
            </DialogDescription>
          </DialogHeader>
          
          {selectedMember && (
            <div className="py-4">
              <div className="flex flex-col items-center mb-4">
                <Avatar
                  src={selectedMember.user?.profilePic}
                  fallback={(selectedMember.user?.fullName || selectedMember.user?.username || 'U').substring(0, 2).toUpperCase()}
                  size="xl"
                  className="mb-2"
                />
                <h2 className="text-xl font-semibold">
                  {selectedMember.user?.fullName || selectedMember.user?.username || `User ${selectedMember.userId}`}
                </h2>
                <Badge className={`mt-1 ${getRoleBadgeColor(selectedMember.role)}`}>
                  {getFormattedRole(selectedMember.role)}
                </Badge>
                <div className="flex mt-2">
                  {renderStars(selectedMember.rating)}
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-neutral-200 dark:border-neutral-700">
                  <span className="text-neutral-500 dark:text-neutral-400">Email</span>
                  <span>{selectedMember.user?.email || 'Not provided'}</span>
                </div>
                
                <div className="flex justify-between py-2 border-b border-neutral-200 dark:border-neutral-700">
                  <span className="text-neutral-500 dark:text-neutral-400">Location</span>
                  <span>{selectedMember.user?.location || 'Not provided'}</span>
                </div>
                
                <div className="flex justify-between py-2 border-b border-neutral-200 dark:border-neutral-700">
                  <span className="text-neutral-500 dark:text-neutral-400">Member Since</span>
                  <span>{formatDate(selectedMember.joinedAt)}</span>
                </div>
                
                <div className="flex justify-between py-2 border-b border-neutral-200 dark:border-neutral-700">
                  <span className="text-neutral-500 dark:text-neutral-400">Contribution</span>
                  <span>
                    {selectedMember.contributionAmount
                      ? `KES ${selectedMember.contributionAmount} ${getFrequencyLabel(selectedMember.contributionFrequency)}`
                      : 'Not set'}
                  </span>
                </div>
                
                <div className="flex justify-between py-2">
                  <span className="text-neutral-500 dark:text-neutral-400">Status</span>
                  <Badge variant={selectedMember.isActive ? "outline" : "destructive"}>
                    {selectedMember.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
              
              <div className="flex justify-between mt-6">
                <Button variant="outline">Message</Button>
                <Button variant="destructive">Remove Member</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ChamaMemberList;
