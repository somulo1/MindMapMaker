import { useState, useEffect, ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Settings, 
  Users, 
  FileText, 
  ShoppingBag, 
  MessageSquare, 
  BarChart3,
  LogOut,
  Menu,
  Bell,
  X
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import NotificationPanel from "./NotificationPanel";
import AdminMobileNavigation from "./AdminMobileNavigation";
import { useQuery } from "@tanstack/react-query";
import { Notification } from "@shared/schema";

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
}

export default function AdminLayout({ children, title }: AdminLayoutProps) {
  const [location] = useLocation();
  const { logoutMutation, user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Get unread notifications count
  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
  });
  
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // Close sidebar and notifications panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarOpen || notificationsOpen) {
        const sidebar = document.getElementById("admin-sidebar");
        const notificationPanel = document.getElementById("admin-notification-panel");
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

  const navItems = [
    {
      title: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
    },
    {
      title: "Users",
      href: "/admin/users",
      icon: Users,
    },
    {
      title: "Chamas",
      href: "/admin/chamas",
      icon: Users,
    },
    {
      title: "Transactions",
      href: "/admin/transactions",
      icon: FileText,
    },
    {
      title: "Marketplace",
      href: "/admin/marketplace",
      icon: ShoppingBag,
    },
    {
      title: "Messages",
      href: "/admin/messages",
      icon: MessageSquare,
    },
    {
      title: "Reports",
      href: "/admin/reports",
      icon: BarChart3,
    },
    {
      title: "API Settings",
      href: "/admin/api-settings",
      icon: Settings,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 lg:px-6">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden"
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle sidebar</span>
        </button>

        <div className="flex-1">
          <h1 className="text-lg font-semibold">{title}</h1>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setNotificationsOpen(true)}
            className="relative"
          >
            <Bell className="h-6 w-6" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-medium text-primary-foreground flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
          
          <div className="text-sm hidden md:block">
            {user ? (
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Logged in as:</span>
                <span className="font-medium">{user.fullName}</span>
              </div>
            ) : null}
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside 
          id="admin-sidebar"
          className={cn(
            "fixed inset-y-0 left-0 z-20 w-64 bg-background border-r transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static",
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex h-16 items-center border-b px-4">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <span className="text-lg text-primary">Chama Admin</span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="ml-auto lg:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex flex-col gap-1 p-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  buttonVariants({ variant: "ghost" }),
                  "justify-start gap-2",
                  location === item.href
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.title}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className={cn(
                buttonVariants({ variant: "ghost" }),
                "justify-start gap-2 mt-auto text-muted-foreground hover:text-foreground"
              )}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </nav>
        </aside>

        {/* Sidebar overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-10 lg:hidden" 
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <main className="flex-1 overflow-y-auto bg-muted p-4 lg:p-6 pb-20 lg:pb-6">
          {children}
        </main>

        {/* Mobile Navigation */}
        <AdminMobileNavigation />

        {/* Notification panel */}
        <div id="admin-notification-panel">
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
    </div>
  );
}