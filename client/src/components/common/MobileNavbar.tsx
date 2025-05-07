import React from 'react';
import { Link, useLocation } from 'wouter';
import { Home, Users, MessageCircle, Wallet, Menu } from 'lucide-react';

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ href, icon, label, isActive }) => {
  const textColorClass = isActive 
    ? 'text-primary' 
    : 'text-neutral-500 dark:text-neutral-400';

  return (
    <Link href={href}>
      <a className={`flex flex-col items-center py-2 px-3 ${textColorClass}`}>
        {icon}
        <span className="text-xs mt-1">{label}</span>
      </a>
    </Link>
  );
};

const MobileNavbar: React.FC = () => {
  const [location] = useLocation();

  return (
    <nav className="md:hidden bg-white dark:bg-neutral-800 shadow-lg border-t border-neutral-200 dark:border-neutral-700 safe-bottom z-10">
      <div className="flex justify-around">
        <NavItem 
          href="/" 
          icon={<Home size={20} />} 
          label="Home" 
          isActive={location === '/'}
        />
        <NavItem 
          href="/chamas" 
          icon={<Users size={20} />} 
          label="Chamas" 
          isActive={location.startsWith('/chamas')}
        />
        <NavItem 
          href="/messages" 
          icon={<MessageCircle size={20} />} 
          label="Chat" 
          isActive={location.startsWith('/messages')}
        />
        <NavItem 
          href="/wallet" 
          icon={<Wallet size={20} />} 
          label="Wallet" 
          isActive={location.startsWith('/wallet')}
        />
        <NavItem 
          href="/settings" 
          icon={<Menu size={20} />} 
          label="More" 
          isActive={location.startsWith('/settings')}
        />
      </div>
    </nav>
  );
};

export default MobileNavbar;
