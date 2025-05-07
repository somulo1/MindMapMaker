import React from 'react';
import Sidebar from '../common/Sidebar';

interface DesktopLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

const DesktopLayout: React.FC<DesktopLayoutProps> = ({ 
  children, 
  title = "Dashboard",
  subtitle = "Welcome back to your financial hub."
}) => {
  return (
    <div className="hidden md:flex h-full">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto bg-neutral-50 dark:bg-neutral-900 p-6">
        <div className="max-w-6xl mx-auto">
          <header className="mb-6">
            <h1 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100">{title}</h1>
            <p className="text-neutral-500 dark:text-neutral-400">{subtitle}</p>
          </header>
          
          {children}
        </div>
      </main>
    </div>
  );
};

export default DesktopLayout;
