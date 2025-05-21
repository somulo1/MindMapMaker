import { useState, useEffect } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import MobileNavigation from "./MobileNavigation";
import NotificationPanel from "./NotificationPanel";
import { useQuery } from "@tanstack/react-query";
import { Notification } from "@shared/schema";

interface UserLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export default function UserLayout({ children, title = "Chama App" }: UserLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  
  // Get unread notifications count
  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
  });
  
  const unreadCount = notifications.filter(n => !n.read).length;

  // Close sidebar and notifications panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarOpen || notificationsOpen) {
        const sidebar = document.getElementById("sidebar");
        const notificationPanel = document.getElementById("notification-panel");
        const target = event.target as Node;
        
        if (sidebar && !sidebar.contains(target) && sidebarOpen) {
          setSidebarOpen(false);
        }
        
        if (notificationPanel && !notificationPanel.contains(target) && notificationsOpen) {
          setNotificationsOpen(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [sidebarOpen, notificationsOpen]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Fixed header */}
      <div className="sticky top-0 z-50 bg-background">
        <Header 
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
          title={title}
        />
      </div>

      {/* Main content area with sidebar and main content */}
      <div className="flex flex-1 h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        <div className="hidden md:block w-64 flex-shrink-0">
          <Sidebar 
            isOpen={sidebarOpen} 
            closeSidebar={() => setSidebarOpen(false)} 
          />
        </div>

        {/* Mobile sidebar */}
        <div className="md:hidden">
          <Sidebar 
            isOpen={sidebarOpen} 
            closeSidebar={() => setSidebarOpen(false)} 
          />
        </div>
        
        {/* Sidebar overlay for mobile */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-10 md:hidden" 
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        {/* Main content */}
        <main className="flex-1 overflow-y-auto bg-muted p-4 md:p-6 pb-20 md:pb-6">
          {children}
        </main>
      </div>
      
      {/* Mobile navigation */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden">
        <MobileNavigation />
      </div>
      
      {/* Notification panel */}
      <div id="notification-panel">
        <NotificationPanel 
          isOpen={notificationsOpen} 
          closeNotifications={() => setNotificationsOpen(false)} 
        />
      </div>
      
      {/* Notification panel overlay */}
      {notificationsOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20" 
          onClick={() => setNotificationsOpen(false)}
        />
      )}
    </div>
  );
}
