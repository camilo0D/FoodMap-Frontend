import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const MapPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card shadow-nav">
        <div className="container flex items-center gap-4 py-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <span className="text-2xl font-bold text-primary">FoodMap</span>
          <span className="text-muted-foreground text-sm hidden sm:inline">
            — Restaurantes en Buenaventura
          </span>
        </div>
      </header>

      {/* Map */}
      <div className="flex-1 relative">
        <iframe
          title="Mapa de restaurantes en Buenaventura"
          src="https://www.google.com/maps/embed?pb=!1m16!1m12!1m3!1d63612.94!2d-77.05!3d3.88!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!2m1!1srestaurantes+comida+buenaventura+colombia!5e0!3m2!1ses!2sco!4v1710000000000"
          className="w-full h-full absolute inset-0 border-0"
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </div>
  );
};

export default MapPage;
