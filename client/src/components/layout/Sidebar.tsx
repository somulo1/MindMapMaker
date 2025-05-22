import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { 
  Home, Wallet, School, ShoppingCart, MessageSquare, Brain, 
  Settings, LogOut, Users, Plus, UserCog, Building2
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Chama } from "@shared/schema";
import { MdEmojiPeople } from "react-icons/md";
import { apiRequest } from "@/lib/queryClient";

interface SidebarProps {
  isOpen: boolean;
  closeSidebar: () => void;
}

export default function Sidebar({ isOpen, closeSidebar }: SidebarProps) {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();
  const [isMobile, setIsMobile] = useState(false);

  const { data: chamasResponse } = useQuery<{ chamas: Chama[] }>({
    queryKey: ["/api/chamas"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/chamas");
      return response.json();
    },
    enabled: !!user
  });

  const chamas = chamasResponse?.chamas || [];

  const { data: walletResponse } = useQuery<{ wallet: { balance: number, currency: string } }>({
    queryKey: ["/api/wallets/user"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/wallets/user");
      return response.json();
    },
    enabled: !!user
  });

  const wallet = walletResponse?.wallet || { balance: 0, currency: "KES" };

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  const handleLinkClick = () => {
    if (isMobile) {
      closeSidebar();
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const chamaRoleBadge = (role: string) => {
    const colorMap: Record<string, string> = {
      'chairperson': 'bg-success text-white',
      'treasurer': 'bg-info text-white',
      'secretary': 'bg-info text-white',
      'member': 'bg-secondary text-foreground'
    };
    
    const roleDisplay: Record<string, string> = {
      'chairperson': 'Chair',
      'treasurer': 'Treasurer',
      'secretary': 'Secretary',
      'member': 'Member'
    };
    
    return (
      <Badge className={`ml-auto text-xs ${colorMap[role] || 'bg-muted'}`}>
        {roleDisplay[role] || role}
      </Badge>
    );
  };

  const sidebarClasses = `
    bg-white w-64 h-[calc(100vh-4rem)] overflow-hidden
    fixed md:sticky top-16 left-0 transition-transform duration-300 ease-in-out z-20
    ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
    border-r border-border shadow-sm
  `;

  return (
    <div className={sidebarClasses}>
      <div className="h-full flex flex-col">
        {/* Profile section */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center">
            <Avatar className="h-12 w-12">
              <AvatarImage src="" alt={user?.fullName || "User"} />
              <AvatarFallback>{user ? getInitials(user.fullName) : "U"}</AvatarFallback>
            </Avatar>
            <div className="ml-3">
              <p className="text-sm font-medium">{user?.fullName || "User"}</p>
              <p className="text-xs text-muted-foreground">{user?.email || "user@example.com"}</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="bg-muted rounded-md p-2">
              <p className="text-xs text-muted-foreground">Wallet Balance</p>
              <p className="font-mono text-sm font-medium">
                {wallet.currency} {wallet.balance.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
        
        {/* Navigation */}
        <ScrollArea className="flex-1">
          <nav className="p-2">
            <div className="space-y-1">
              <p className="px-2 pt-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                User Dashboard
              </p>
              
              <Link to="/" onClick={handleLinkClick}>
                <Button 
                  variant={isActive("/") ? "secondary" : "ghost"} 
                  className="w-full justify-start"
                >
                  <Home className="mr-2 h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
              
              <Link to="/wallet" onClick={handleLinkClick}>
                <Button 
                  variant={isActive("/wallet") ? "secondary" : "ghost"} 
                  className="w-full justify-start"
                >
                  <Wallet className="mr-2 h-4 w-4" />
                  My Wallet
                </Button>
              </Link>

              <Link to="/learning" onClick={handleLinkClick}>
                <Button 
                  variant={isActive("/learning") ? "secondary" : "ghost"} 
                  className="w-full justify-start"
                >
                  <School className="mr-2 h-4 w-4" />
                  Learning
                </Button>
              </Link>

              <Link to="/ai-assistant" onClick={handleLinkClick}>
                <Button 
                  variant={isActive("/ai-assistant") ? "secondary" : "ghost"} 
                  className="w-full justify-start"
                >
                  <Brain className="mr-2 h-4 w-4" />
                  AI Assistant
                </Button>
              </Link>
              
              <Link to="/marketplace" onClick={handleLinkClick}>
                <Button 
                  variant={isActive("/marketplace") ? "secondary" : "ghost"} 
                  className="w-full justify-start"
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Marketplace
                </Button>
              </Link>
              
              <Link to="/messages" onClick={handleLinkClick}>
                <Button 
                  variant={isActive("/messages") ? "secondary" : "ghost"} 
                  className="w-full justify-start"
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Messages
                  <Badge className="ml-auto bg-accent text-white">2</Badge>
                </Button>
              </Link>

              {/* Chamas Section */}
              <p className="px-2 pt-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                My Chamas
              </p>

              {Array.isArray(chamas) && chamas.map((chama) => (
                <Link key={chama.id} to={`/chamas/${chama.id}`} onClick={handleLinkClick}>
                  <Button 
                    variant={isActive(`/chamas/${chama.id}`) ? "secondary" : "ghost"} 
                    className="w-full justify-start"
                  >
                    <Building2 className="mr-2 h-4 w-4" />
                    {chama.name}
                    {chamaRoleBadge(chama.role)}
                  </Button>
                </Link>
              ))}

              <Link to="/chamas/create" onClick={handleLinkClick}>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-muted-foreground"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create New Chama
                </Button>
              </Link>

              {/* Settings Section */}
              <p className="px-2 pt-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Settings
              </p>

              <Link to="/settings" onClick={handleLinkClick}>
                <Button 
                  variant={isActive("/settings") ? "secondary" : "ghost"} 
                  className="w-full justify-start"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Button>
              </Link>

              <Button 
                variant="ghost" 
                className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => logoutMutation.mutate()}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </nav>
        </ScrollArea>
      </div>
    </div>
  );
}
