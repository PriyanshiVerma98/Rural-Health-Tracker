import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Heart, LogOut, User } from "lucide-react";

export function Header() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/auth/logout", {});
    },
    onSuccess: () => {
      queryClient.clear();
      setLocation("/login");
      toast({
        title: "Logged out",
        description: "You have been logged out successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to logout",
        variant: "destructive",
      });
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <header className="bg-medical-blue text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Heart className="h-6 w-6" />
            <h1 className="text-xl font-medium">Rural Health Tracker</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span className="text-sm">{user?.name}</span>
              {user?.role === 'admin' && (
                <span className="text-xs bg-red-500 px-2 py-1 rounded">Admin</span>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
              className="text-white hover:bg-blue-700"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
