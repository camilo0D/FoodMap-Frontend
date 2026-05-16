import { Button } from "@/components/ui/button";
import { ArrowLeft, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { logoutUser, getUsername } from "@/services/auth";
import { toast } from "sonner";
import MapView from "@/components/MapView";

const MapPage = () => {
  const navigate = useNavigate();
  const username = getUsername();

  const handleLogout = async () => {
    await logoutUser();
    toast.success("Sesión cerrada");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-50 bg-card shadow-nav">
        <div className="container flex items-center gap-4 py-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate("/")}
            className="text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <span className="text-2xl font-bold text-primary">FoodMap</span>
          <span className="text-muted-foreground text-sm hidden sm:inline">
            — Restaurantes cerca de ti
          </span>

          <div className="ml-auto flex items-center gap-3">
            {username && (
              <span className="text-sm font-medium text-foreground hidden sm:inline">
                Hola, {username}
              </span>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="flex items-center gap-2 text-muted-foreground hover:text-destructive transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Cerrar sesión</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container py-6">
        <MapView />
      </main>
    </div>
  );
};

export default MapPage;