import { Button } from "@/components/ui/button";
import { ArrowLeft, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { logoutUser, getUsername } from "@/services/auth";
import { toast } from "sonner";

// Fix para los íconos de Leaflet en Vite
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

const API_URL = "http://127.0.0.1:8000/api";

interface Categoria {
  id: string;
  nombre: string;
  icono: string;
}

interface Restaurante {
  id: string;
  nombre: string;
  descripcion: string;
  telefono: string;
  imagen: string;
  direccion: string;
  latitud: number;
  longitud: number;
  categoria: Categoria | null;
  horario: Record<string, string>;
  calificacion_promedio: number;
  total_calificaciones: number;
}

const MapPage = () => {
  const navigate = useNavigate();
  const [restaurantes, setRestaurantes] = useState<Restaurante[]>([]);
  const [loading, setLoading] = useState(true);
  const username = getUsername();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/");
      return;
    }

    const fetchRestaurantes = async () => {
      try {
        const res = await fetch(`${API_URL}/restaurantes/`);
        const data = await res.json();
        setRestaurantes(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error cargando restaurantes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurantes();
  }, [navigate]);

  const handleLogout = async () => {
    await logoutUser();
    toast.success("Sesión cerrada");
    navigate("/");
  };

  const center: [number, number] =
    restaurantes.length > 0
      ? [Number(restaurantes[0].latitud), Number(restaurantes[0].longitud)]
      : [4.711, -74.0721];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-50 bg-card shadow-nav">
        <div className="container flex items-center gap-4 py-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <span className="text-2xl font-bold text-primary">FoodMap</span>
          <span className="text-muted-foreground text-sm hidden sm:inline">
            — Restaurantes cerca de ti
          </span>

          <div className="ml-auto flex items-center gap-3">
            {!loading && (
              <span className="text-sm text-muted-foreground">
                {restaurantes.length} restaurante{restaurantes.length !== 1 ? "s" : ""}
              </span>
            )}
            {username && (
              <span className="text-sm font-medium text-foreground hidden sm:inline">
                Hola, {username}
              </span>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="flex items-center gap-2 text-muted-foreground hover:text-destructive"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Cerrar sesión</span>
            </Button>
          </div>
        </div>
      </header>

      <div style={{ height: "calc(100vh - 65px)", position: "relative" }}>
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-background">
            <p className="text-muted-foreground">Cargando restaurantes...</p>
          </div>
        ) : (
          <MapContainer
            center={center}
            zoom={14}
            style={{ width: "100%", height: "100%" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {restaurantes.map((restaurante) => (
              <Marker
                key={restaurante.id}
                position={[Number(restaurante.latitud), Number(restaurante.longitud)]}
              >
                <Popup>
                  <div style={{ minWidth: "180px" }}>
                    {restaurante.imagen && (
                      <img
                        src={restaurante.imagen}
                        alt={restaurante.nombre}
                        style={{ width: "100%", height: "100px", objectFit: "cover", borderRadius: "6px", marginBottom: "8px" }}
                      />
                    )}
                    <strong style={{ fontSize: "14px" }}>{restaurante.nombre}</strong>
                    {restaurante.categoria && (
                      <p style={{ fontSize: "12px", color: "#888", margin: "2px 0" }}>
                        {restaurante.categoria.icono} {restaurante.categoria.nombre}
                      </p>
                    )}
                    {restaurante.descripcion && (
                      <p style={{ fontSize: "12px", margin: "4px 0" }}>{restaurante.descripcion}</p>
                    )}
                    <p style={{ fontSize: "12px", color: "#888" }}>{restaurante.direccion}</p>
                    {restaurante.telefono && (
                      <p style={{ fontSize: "12px", color: "#888" }}>📞 {restaurante.telefono}</p>
                    )}
                    {restaurante.calificacion_promedio > 0 && (
                      <p style={{ fontSize: "12px", fontWeight: "bold", marginTop: "4px" }}>
                        ⭐ {restaurante.calificacion_promedio} ({restaurante.total_calificaciones} reseñas)
                      </p>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
      </div>
    </div>
  );
};

export default MapPage;