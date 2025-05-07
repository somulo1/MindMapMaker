import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Link } from 'wouter';
import { Users, Sprout } from 'lucide-react';

interface ChamaCardProps {
  chama: {
    id: number;
    name: string;
    description?: string;
    icon: string;
    iconBg: string;
    memberCount: number;
    balance: number;
    establishedDate: string;
    nextMeeting?: string;
  };
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
    <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm overflow-hidden">
      <div className={`h-24 ${getBgColorClass()} flex items-end p-4`}>
        <div className="w-16 h-16 rounded-lg bg-white dark:bg-neutral-800 shadow-md flex items-center justify-center -mb-8">
          <span className={`text-${chama.iconBg}`}>
            {getIconComponent()}
          </span>
        </div>
      </div>
      <div className="p-4 pt-10">
        <h3 className="font-semibold text-lg">{chama.name}</h3>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-3">
          {chama.memberCount} members • Est. {formattedEstablished}
        </p>
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-medium">Next Meeting</span>
          <span className="text-sm text-neutral-700 dark:text-neutral-300">{nextMeetingDate}</span>
        </div>
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm font-medium">Group Balance</span>
          <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">{formattedBalance}</span>
        </div>
        <Button 
          className={`w-full ${getButtonColorClass()} text-white py-2 rounded-lg transition-colors`}
          asChild
        >
          <Link href={`/chamas/${chama.id}`}>View Chama</Link>
        </Button>
      </div>
    </div>
  );
};

export default ChamaCard;
