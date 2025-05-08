import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import MobileNavbar from '../common/MobileNavbar';
import {
  MdMenu,
  MdSearch,
  MdNotifications,
  MdDashboard,
  MdGroups,
  MdMessage,
  MdAccountBalanceWallet,
  MdStorefront,
  MdSchool,
  MdSmartToy,
  MdSettings,
  MdExitToApp,
} from 'react-icons/md';

interface MobileLayoutProps {
  children: React.ReactNode;
  showHeader?: boolean;
  title?: string;
}

const MobileLayout: React.FC<MobileLayoutProps> = ({
  children,
  showHeader = true,
  title = 'Tujifund',
}) => {
  const [location] = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const onToggleSidebar = () => setIsSidebarOpen(prev => !prev);

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {showHeader && (
        <header className="sticky top-0 bg-white/90 dark:bg-neutral-800/90 backdrop-blur-sm shadow z-50 py-3 px-4 flex items-center justify-between transition-colors duration-200">
          <div className="flex items-center space-x-3">
            <button
              className="md:hidden p-2 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
              onClick={onToggleSidebar}
              aria-label="Toggle menu"
            >
              <MdMenu className="text-2xl text-neutral-700 dark:text-neutral-200" />
            </button>
            <h1 className="text-lg md:text-2xl font-extrabold text-primary">{title}</h1>
          </div>

          {/* Always-visible search input */}
          <div className="flex flex-1 mx-4">
            <div className="relative w-full">
              <MdSearch className="absolute top-1/2 left-3 transform -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full py-2 pl-10 pr-4 bg-neutral-100 dark:bg-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors">
              <MdNotifications className="text-xl text-neutral-700 dark:text-neutral-200" />
            </button>
            <Link href="/settings">
              <a className="relative">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-semibold">JD</div>
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-success rounded-full border-2 border-white dark:border-neutral-800" />
              </a>
            </Link>
          </div>
        </header>
      )}

      {isSidebarOpen && (
        <aside className="fixed inset-0 flex z-40">
          <div className="w-64 bg-white dark:bg-neutral-900 shadow-lg p-4 overflow-y-auto">
            <nav>
              <ul className="space-y-3">
                {[
                  { label: 'Personal Dashboard', icon: MdDashboard, href: '/dashboard' },
                  { label: 'My Chamas', icon: MdGroups, href: '/chamas' },
                  { label: 'Messages', icon: MdMessage, href: '/messages' },
                  { label: 'My Wallet', icon: MdAccountBalanceWallet, href: '/wallet' },
                  { label: 'Marketplace', icon: MdStorefront, href: '/marketplace' },
                  { label: 'Learning Hub', icon: MdSchool, href: '/learning' },
                  { label: 'AI Assistant', icon: MdSmartToy, href: '/ai-assistant' },
                  { label: 'Settings', icon: MdSettings, href: '/settings' },
                  { label: 'Logout', icon: MdExitToApp, href: '/logout' },
                ].map(({ label, icon: Icon, href }) => (
                  <li key={label}>
                    <Link href={href}>
                      <a
                        className={`flex items-center space-x-2 py-2 px-3 rounded transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800
                          ${location === href ? 'bg-neutral-200 dark:bg-neutral-700' : ''}`}
                        onClick={onToggleSidebar}
                      >
                        <Icon className="text-xl text-neutral-700 dark:text-neutral-200" />
                        <span className="text-base font-medium text-neutral-800 dark:text-neutral-100">{label}</span>
                      </a>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
          <div className="flex-1 bg-black/50" onClick={onToggleSidebar} aria-label="Close menu" />
        </aside>
      )}

      <main className="flex-1 overflow-y-auto bg-neutral-50 dark:bg-neutral-900">
        {children}
      </main>

      <MobileNavbar />
    </div>
  );
};

export default MobileLayout;
