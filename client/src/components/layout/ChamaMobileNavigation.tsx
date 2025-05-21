import { Link, useLocation, useParams } from "wouter";
import { 
  LayoutDashboard,
  Users,
  Calculator,
  FileText,
  Settings,
  Calendar
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function ChamaMobileNavigation() {
  const [location] = useLocation();
  const { id } = useParams<{ id: string }>();
  const chamaId = parseInt(id || "0");

  const isActive = (path: string) => {
    if (path === `/chamas/${chamaId}` && location === `/chamas/${chamaId}`) return true;
    if (path !== `/chamas/${chamaId}` && location.startsWith(path)) return true;
    return false;
  };

  const navItems = [
    {
      href: `/chamas/${chamaId}`,
      icon: LayoutDashboard,
      label: "Dashboard"
    },
    {
      href: `/chamas/${chamaId}/members`,
      icon: Users,
      label: "Members"
    },
    {
      href: `/chamas/${chamaId}/contributions`,
      icon: Calculator,
      label: "Contrib."
    },
    {
      href: `/chamas/${chamaId}/meetings`,
      icon: Calendar,
      label: "Meetings"
    },
    {
      href: `/chamas/${chamaId}/documents`,
      icon: FileText,
      label: "Docs"
    },
    {
      href: `/chamas/${chamaId}/settings`,
      icon: Settings,
      label: "Settings"
    }
  ];

  return (
    <nav className={cn(
      "md:hidden fixed bottom-0 left-0 right-0 bg-background border-t z-50",
      "h-16 flex items-center justify-around px-2"
    )}>
      {navItems.map((item) => (
        <Link key={item.href} to={item.href}>
          <button 
            className={cn(
              "flex flex-col items-center justify-center p-1 min-w-[4rem]",
              "text-xs transition-colors",
              isActive(item.href) 
                ? "text-primary" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <item.icon className="h-5 w-5 mb-1" />
            <span>{item.label}</span>
          </button>
        </Link>
      ))}
    </nav>
  );
}