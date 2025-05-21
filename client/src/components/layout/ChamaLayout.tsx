import { useState, useEffect } from "react";
import { ChamaSidebar } from "./ChamaSidebar";
import NotificationPanel from "./NotificationPanel";
import ChamaMobileNavigation from "./ChamaMobileNavigation";
import { useQuery } from "@tanstack/react-query";
import { Notification } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

interface ChamaLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export default function ChamaLayout({ children, title = "Chama Dashboard" }: ChamaLayoutProps) {
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
        const sidebar = document.getElementById("chama-sidebar");
        const notificationPanel = document.getElementById("chama-notification-panel");
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
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="h-16 border-b bg-background flex items-center px-4 sticky top-0 z-40">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden mr-2"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle sidebar</span>
        </Button>
        <h1 className="text-lg font-semibold">{title}</h1>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div id="chama-sidebar" className="h-[calc(100vh-4rem)]">
          <ChamaSidebar 
            isOpen={sidebarOpen}
            closeSidebar={() => setSidebarOpen(false)}
          />
        </div>
        
        {/* Sidebar overlay for mobile */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-30 md:hidden" 
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        {/* Main content */}
        <main className="flex-1 overflow-y-auto bg-muted p-4 md:p-6 pb-20 md:pb-6">
          {children}
        </main>
      </div>
      
      {/* Mobile navigation */}
      <ChamaMobileNavigation />
      
      {/* Notifications */}
      <div id="chama-notification-panel">
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
