import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";

export function ChamaHeader() {
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();
  const chamaId = parseInt(id);

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

  return (
    <header className="fixed top-0 left-0 right-0 h-16 border-b bg-background z-50">
      <div className="h-full px-2 sm:px-4 flex items-center justify-between">
        <div className="flex items-center gap-4 sm:gap-6">
          <Button 
            variant="ghost" 
            asChild 
            className="gap-1 p-1 sm:p-2 h-9 sm:h-10"
          >
            <Link to="/">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back to Dashboard</span>
            </Link>
          </Button>
          {chama && (
            <div className="hidden sm:block">
              <h1 className="text-sm font-medium">{chama.name}</h1>
              <p className="text-xs text-muted-foreground">Chama Dashboard</p>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <span className="text-xs sm:text-sm text-muted-foreground">
            {user?.fullName}
          </span>
        </div>
      </div>
    </header>
  );
} 