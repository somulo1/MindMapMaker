import React from 'react';
import { Link, useLocation } from 'wouter';
import MobileNavbar from '../common/MobileNavbar';

interface MobileLayoutProps {
  children: React.ReactNode;
  showHeader?: boolean;
  title?: string;
}

const MobileLayout: React.FC<MobileLayoutProps> = ({ 
  children, 
  showHeader = true,
  title = "Tujifund"
}) => {
  const [location] = useLocation();
  
  return (
    <div className="flex flex-col h-screen">
      {showHeader && (
        <header className="ios-header bg-white dark:bg-neutral-800 shadow-sm z-10 py-3 px-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="material-icons text-primary">account_balance</span>
            <h1 className="text-xl font-semibold text-primary">{title}</h1>
          </div>
          <div className="flex items-center space-x-3">
            <button className="p-1 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-700">
              <span className="material-icons text-neutral-700 dark:text-neutral-200">search</span>
            </button>
            <button className="p-1 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-700">
              <span className="material-icons text-neutral-700 dark:text-neutral-200">notifications</span>
            </button>
            <Link href="/profile">
              <a className="relative">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
                  JD
                </div>
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-success rounded-full border-2 border-white dark:border-neutral-800"></span>
              </a>
            </Link>
          </div>
        </header>
      )}

      <main className="flex-1 overflow-y-auto bg-neutral-50 dark:bg-neutral-900">
        {children}
      </main>

      <MobileNavbar />
    </div>
  );
};

export default MobileLayout;
