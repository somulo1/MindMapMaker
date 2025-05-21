import { useRef } from "react";
import { useParams, Link, useLocation } from "wouter";
import { 
  LayoutDashboard, Users, Calculator, FileText, Settings, 
  Calendar, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

interface ChamaSidebarProps {
  isOpen: boolean;
  closeSidebar: () => void;
}

export function ChamaSidebar({ isOpen, closeSidebar }: ChamaSidebarProps) {
  const { id } = useParams<{ id: string }>();
  const chamaId = parseInt(id);
  const [location] = useLocation();
  const sidebarRef = useRef<HTMLDivElement>(null);
  
  const { data: chama } = useQuery({
    queryKey: [`/api/chamas/${chamaId}`],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/chamas/${chamaId}`);
        if (!response.ok) throw new Error('Failed to fetch chama details');
        const data = await response.json();
        return data || null;
      } catch (error) {
        console.error('Error fetching chama details:', error);
        return null;
      }
    },
    enabled: !isNaN(chamaId)
  });

  const navigation = [
    {
      href: `/chamas/${chamaId}`,
      icon: LayoutDashboard,
      name: "Dashboard"
    },
    {
      href: `/chamas/${chamaId}/members`,
      icon: Users,
      name: "Members"
    },
    {
      href: `/chamas/${chamaId}/contributions`,
      icon: Calculator,
      name: "Contributions"
    },
    {
      href: `/chamas/${chamaId}/meetings`,
      icon: Calendar,
      name: "Meetings"
    },
    {
      href: `/chamas/${chamaId}/documents`,
      icon: FileText,
      name: "Documents"
    },
    {
      href: `/chamas/${chamaId}/settings`,
      icon: Settings,
      name: "Settings"
    }
  ];

  return (
    <aside 
      ref={sidebarRef}
      className={cn(
        "w-64 bg-background border-r h-full",
        "md:sticky md:top-0",
        "fixed inset-y-0 left-0 z-40 transform transition-transform duration-200 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}
    >
      <div className="h-full overflow-y-auto p-4">
        {/* Mobile close button */}
        <div className="flex items-center justify-between md:hidden mb-4">
          <h2 className="text-lg font-semibold">Chama Menu</h2>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={closeSidebar}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Chama Info */}
        {chama ? (
          <div className="mb-6">
            <h1 className="text-xl font-semibold mb-2">{chama.name}</h1>
            <p className="text-sm text-muted-foreground">{chama.description || "No description provided"}</p>
          </div>
        ) : (
          <div className="space-y-2 mb-6">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-full" />
          </div>
        )}

        {/* Navigation */}
        <nav className="space-y-1">
          {navigation.map((item) => {
            const isActive = location === item.href;
            return (
              <Button
                key={item.name}
                variant={isActive ? "secondary" : "ghost"}
                asChild
                className={cn(
                  "w-full justify-start gap-2",
                  isActive && "bg-secondary"
                )}
                onClick={() => closeSidebar()}
              >
                <Link to={item.href}>
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              </Button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
} 