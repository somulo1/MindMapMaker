import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard,
  Users,
  FileText,
  ShoppingBag,
  MessageSquare,
  BarChart3,
  Settings
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Message } from "@shared/schema";

export default function AdminMobileNavigation() {
  const [location] = useLocation();
  
  // Get unread messages count
  const { data: messages = [] } = useQuery<Message[]>({
    queryKey: ["/api/messages"],
  });
  
  const unreadCount = messages.filter(m => !m.read).length;

  const isActive = (path: string) => {
    if (path === "/admin" && location === "/admin") return true;
    if (path !== "/admin" && location.startsWith(path)) return true;
    return false;
  };

  const navItems = [
    {
      href: "/admin",
      icon: LayoutDashboard,
      label: "Overview"
    },
    {
      href: "/admin/users",
      icon: Users,
      label: "Users"
    },
    {
      href: "/admin/transactions",
      icon: FileText,
      label: "Records"
    },
    {
      href: "/admin/marketplace",
      icon: ShoppingBag,
      label: "Market"
    },
    {
      href: "/admin/messages",
      icon: MessageSquare,
      label: "Chat",
      badge: unreadCount
    }
  ];

  return (
    <nav className="md:hidden bg-white border-t border-border fixed bottom-0 w-full z-10 shadow-[0_-1px_2px_rgba(0,0,0,0.05)]">
      <div className="flex justify-around">
        {navItems.map((item) => (
          <Link key={item.href} to={item.href}>
            <button 
              className={`flex flex-col items-center justify-center p-3 relative ${
                isActive(item.href) ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <item.icon className="h-5 w-5" />
              {item.badge ? (
                <Badge 
                  className="absolute top-2 right-5 h-4 w-4 flex items-center justify-center bg-primary text-primary-foreground text-xs p-0"
                >
                  {item.badge}
                </Badge>
              ) : null}
              <span className="text-xs mt-1">{item.label}</span>
            </button>
          </Link>
        ))}
      </div>
    </nav>
  );
} 