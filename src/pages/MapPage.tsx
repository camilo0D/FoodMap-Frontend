import { Button } from "@/components/ui/button";
import { ArrowLeft, LogOut, ShieldAlert } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { logoutUser, getUsername, getRoles } from "@/services/auth";
import { toast } from "sonner";
import MapView from "@/components/MapView";
import { useUserProfile } from "@/hooks/useProfile";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import SchemaOrg from "@/components/SchemaOrg";
import SEOHead from "@/components/SEOHead";
import { SERVER_URL as API_BASE } from "@/config";

const MapPage = () => {
  const navigate = useNavigate();
  const username = getUsername();
  const roles = getRoles();
  const isAdmin = roles.includes("admin");
  const { data: profile } = useUserProfile();


  const resolvedAvatar = profile?.avatar
    ? (profile.avatar.startsWith("http") ? profile.avatar : `${API_BASE}${profile.avatar}`)
    : null;

  const initials = (profile?.nombre || profile?.username || username || "U")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleLogout = async () => {
    await logoutUser();
    toast.success("Sesión cerrada");
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* FT-84/FT-92: Schema ItemList para listado en mapa */}
      <SEOHead
        title="Mapa de Restaurantes - FoodMap"
        description="Explora todos los restaurantes en el mapa interactivo."
      />
      <SchemaOrg schema={{
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Inicio", "item": window.location.origin },
          { "@type": "ListItem", "position": 2, "name": "Mapa", "item": `${window.location.origin}/mapa` }
        ]
      }} />
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
            {isAdmin && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/admin")}
                className="flex items-center gap-1.5 text-primary border-primary/20 hover:bg-primary/10 transition-colors font-bold"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                Panel Admin
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/perfil")}
              className="relative focus:outline-none transition-transform hover:scale-105 rounded-full"
              title="Mi Perfil"
              aria-label="Ir a Mi Perfil"
            >
              <Avatar className="w-9 h-9 border border-border shadow-sm ring-2 ring-primary/10">
                {resolvedAvatar ? (
                  <AvatarImage src={resolvedAvatar} alt={profile?.nombre || username || "Avatar"} />
                ) : null}
                <AvatarFallback className="text-xs font-bold bg-primary/10 text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Button>
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