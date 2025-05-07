import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { 
  LayoutDashboard,
  Users,
  MessageCircle,
  Wallet,
  Store,
  BookOpen,
  Usb,
  Settings,
  ChevronDown,
  User
} from 'lucide-react';
import Avatar from './Avatar';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  badge?: number;
}

const NavItem: React.FC<NavItemProps> = ({ href, icon, label, isActive, badge }) => {
  const bgClass = isActive 
    ? 'bg-primary/10 text-primary' 
    : 'hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200';

  return (
    <Link href={href}>
      <a className={`flex items-center space-x-3 p-2 rounded-lg ${bgClass}`}>
        {icon}
        <span>{label}</span>
        {badge && badge > 0 && (
          <span className="ml-auto bg-primary text-white text-xs px-2 py-0.5 rounded-full">
            {badge}
          </span>
        )}
      </a>
    </Link>
  );
};

const Sidebar: React.FC = () => {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [dashboardType, setDashboardType] = useState<'personal' | 'chama'>('personal');
  
  const userInitials = user?.fullName 
    ? user.fullName.split(' ').map(n => n[0]).join('').toUpperCase()
    : user?.username?.substring(0, 2).toUpperCase() || 'U';

  return (
    <aside className="w-64 bg-white dark:bg-neutral-800 shadow-md h-full flex flex-col">
      <div className="p-4 flex items-center space-x-2 border-b border-neutral-200 dark:border-neutral-700">
        <span className="material-icons text-primary text-2xl">account_balance</span>
        <h1 className="text-xl font-semibold text-primary">Tujifund</h1>
      </div>
      
      {/* User Profile Section */}
      <div className="p-4 border-b border-neutral-200 dark:border-neutral-700">
        <div className="flex items-center space-x-3">
          <Avatar 
            src={user?.profilePic}
            fallback={userInitials}
            online={true}
          />
          <div>
            <h2 className="font-medium text-neutral-800 dark:text-neutral-100">
              {user?.fullName || user?.username}
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {user?.email}
            </p>
          </div>
        </div>
      </div>
      
      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto p-2">
        <ul className="space-y-1">
          <li>
            <NavItem
              href="/"
              icon={<LayoutDashboard size={18} />}
              label="Personal Dashboard"
              isActive={location === '/'}
            />
          </li>
          <li>
            <NavItem
              href="/chamas"
              icon={<Users size={18} />}
              label="My Chamas"
              isActive={location.startsWith('/chamas')}
            />
          </li>
          <li>
            <NavItem
              href="/messages"
              icon={<MessageCircle size={18} />}
              label="Messages"
              isActive={location.startsWith('/messages')}
              badge={3}
            />
          </li>
          <li>
            <NavItem
              href="/wallet"
              icon={<Wallet size={18} />}
              label="My Wallet"
              isActive={location.startsWith('/wallet')}
            />
          </li>
          <li>
            <NavItem
              href="/marketplace"
              icon={<Store size={18} />}
              label="Marketplace"
              isActive={location.startsWith('/marketplace')}
            />
          </li>
          <li>
            <NavItem
              href="/learning"
              icon={<BookOpen size={18} />}
              label="Learning Hub"
              isActive={location.startsWith('/learning')}
            />
          </li>
          <li>
            <NavItem
              href="/ai-assistant"
              icon={<Usb size={18} />}
              label="AI Assistant"
              isActive={location.startsWith('/ai-assistant')}
            />
          </li>
          <li>
            <NavItem
              href="/settings"
              icon={<Settings size={18} />}
              label="Settings"
              isActive={location.startsWith('/settings')}
            />
          </li>
        </ul>
      </nav>
      
      {/* Switch Dashboard */}
      <div className="p-4 border-t border-neutral-200 dark:border-neutral-700">
        <button 
          className="w-full flex items-center justify-between p-2 bg-neutral-100 dark:bg-neutral-700 rounded-lg"
          onClick={() => setDashboardType(dashboardType === 'personal' ? 'chama' : 'personal')}
        >
          <div className="flex items-center space-x-2">
            {dashboardType === 'personal' ? (
              <>
                <User size={18} className="text-neutral-700 dark:text-neutral-200" />
                <span className="text-sm">Personal Dashboard</span>
              </>
            ) : (
              <>
                <Users size={18} className="text-neutral-700 dark:text-neutral-200" />
                <span className="text-sm">Chama Dashboard</span>
              </>
            )}
          </div>
          <ChevronDown size={18} className="text-neutral-500" />
        </button>
        
        <Button 
          variant="ghost" 
          className="w-full mt-2 text-neutral-700 dark:text-neutral-200"
          onClick={() => logout()}
        >
          Logout
        </Button>
      </div>
    </aside>
  );
};

export default Sidebar;
