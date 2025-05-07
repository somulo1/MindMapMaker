
import React from 'react';
import { Link, useRoute } from 'wouter';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  Settings,
  Shield,
  Database,
  CreditCard,
  Bot,
  MessageSquare,
  BarChart
} from 'lucide-react';

const AdminNavigation: React.FC = () => {
  const [location] = useRoute();

  const navItems = [
    { href: '/admin', icon: LayoutDashboard, label: 'Overview' },
    { href: '/admin/users', icon: Users, label: 'Users' },
    { href: '/admin/settings', icon: Settings, label: 'Settings' },
    { href: '/admin/security', icon: Shield, label: 'Security' },
    { href: '/admin/backups', icon: Database, label: 'Backups' },
    { href: '/admin/payments', icon: CreditCard, label: 'Payments' },
    { href: '/admin/ai', icon: Bot, label: 'AI System' },
    { href: '/admin/support', icon: MessageSquare, label: 'Support' },
    { href: '/admin/analytics', icon: BarChart, label: 'Analytics' }
  ];

  return (
    <nav className="space-y-1">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <Link key={item.href} href={item.href}>
            <a className={cn(
              "flex items-center px-4 py-2 text-sm font-medium rounded-md",
              location === item.href
                ? "bg-primary text-primary-foreground"
                : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
            )}>
              <Icon className="h-5 w-5 mr-3" />
              {item.label}
            </a>
          </Link>
        );
      })}
    </nav>
  );
};

export default AdminNavigation;
