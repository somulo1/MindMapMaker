import { useState, useEffect, useRef } from "react";
import { useParams, Link, useLocation } from "wouter";
import { 
  LayoutDashboard, Users, Calculator, FileText, Settings, 
  Calendar, Menu, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { Chama } from "@shared/schema";
import { cn } from "@/lib/utils";

export function ChamaSidebar() {
  const { id } = useParams<{ id: string }>();
  const chamaId = parseInt(id);
  const [location] = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  
  const { data: chama, isLoading } = useQuery<Chama>({
    queryKey: [`/api/chamas/${chamaId}`],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/chamas/${chamaId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch chama details');
        }
        const data = await response.json();
        return data || null; // Ensure we always return a value
      } catch (error) {
        console.error('Error fetching chama details:', error);
        return null; // Return null on error
      }
    },
    enabled: !isNaN(chamaId)
  });

  // Close sidebar when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        isSidebarOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node) &&
        menuButtonRef.current &&
        !menuButtonRef.current.contains(event.target as Node)
      ) {
        setIsSidebarOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isSidebarOpen]);

  // Close sidebar on escape key
  useEffect(() => {
    function handleEscapeKey(event: KeyboardEvent) {
      if (event.key === "Escape" && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    }

    document.addEventListener("keydown", handleEscapeKey);
    return () => document.removeEventListener("keydown", handleEscapeKey);
  }, [isSidebarOpen]);

  const navigation = [
    { name: 'Dashboard', href: `/chamas/${chamaId}`, icon: LayoutDashboard },
    { name: 'Members', href: `/chamas/${chamaId}/members`, icon: Users },
    { name: 'Contributions', href: `/chamas/${chamaId}/contributions`, icon: Calculator },
    { name: 'Meetings', href: `/chamas/${chamaId}/meetings`, icon: Calendar },
    { name: 'Documents', href: `/chamas/${chamaId}/documents`, icon: FileText },
    { name: 'Settings', href: `/chamas/${chamaId}/settings`, icon: Settings },
  ];

  return (
    <>
      <Button 
        ref={menuButtonRef}
        variant="ghost" 
        size="icon"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="fixed top-4 left-16 md:hidden z-50"
        aria-label={isSidebarOpen ? "Close menu" : "Open menu"}
      >
        {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      <aside 
        ref={sidebarRef}
        className={cn(
          "fixed top-16 left-0 bottom-0 w-64 bg-background border-r transform transition-transform duration-200 ease-in-out z-40",
          "md:translate-x-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="h-full overflow-y-auto p-4">
          {isLoading ? (
            <Skeleton className="h-10 w-64 mb-2" />
          ) : (
            <h1 className="text-xl font-semibold mb-2">{chama?.name}</h1>
          )}
          
          {isLoading ? (
            <Skeleton className="h-5 w-48" />
          ) : (
            <p className="text-sm text-muted-foreground mb-6">{chama?.description || "No description provided"}</p>
          )}

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
                  onClick={() => setIsSidebarOpen(false)}
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

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </>
  );
} 