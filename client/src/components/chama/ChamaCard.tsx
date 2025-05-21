import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Link } from 'wouter';
import { Users, Sprout } from 'lucide-react';
import { Chama } from "@shared/schema";

interface ChamaCardProps {
  chama: Chama;
}

const ChamaCard: React.FC<ChamaCardProps> = ({ chama }) => {
  const getIconComponent = () => {
    switch (chama.icon) {
      case 'groups':
        return <Users className="text-3xl" />;
      case 'grass':
        return <Sprout className="text-3xl" />;
      default:
        return <Users className="text-3xl" />;
    }
  };

  const getBgColorClass = () => {
    switch (chama.iconBg) {
      case 'primary':
        return 'bg-primary-light';
      case 'secondary':
        return 'bg-secondary';
      default:
        return 'bg-primary-light';
    }
  };

  const getButtonColorClass = () => {
    switch (chama.iconBg) {
      case 'primary':
        return 'bg-primary hover:bg-primary-dark';
      case 'secondary':
        return 'bg-secondary hover:bg-secondary-dark';
      default:
        return 'bg-primary hover:bg-primary-dark';
    }
  };
  
  const formattedBalance = formatCurrency(chama.balance, 'KES');
  const formattedEstablished = new Date(chama.establishedDate).getFullYear();
  const nextMeetingDate = chama.nextMeeting ? formatDate(chama.nextMeeting) : 'Not scheduled';

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold mb-1">{chama.name}</h3>
            <p className="text-sm text-muted-foreground">
              {chama.description || "No description provided"}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Balance</span>
            <span className="font-medium">KES {chama.balance.toLocaleString()}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Members</span>
            <span className="font-medium">{chama.memberCount}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Established</span>
            <span className="font-medium">
              {new Date(chama.establishedDate).toLocaleDateString()}
            </span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="bg-muted p-4">
        <Button variant="link" className="text-primary p-0" asChild>
          <Link to={`/chamas/${chama.id}`}>
            View Dashboard
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ChamaCard;
