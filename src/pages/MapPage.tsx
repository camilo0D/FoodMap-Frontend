import { Button } from "@/components/ui/button";
import { ArrowLeft, LogOut } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import api from "@/lib/api";
import SchemaOrg from "@/components/SchemaOrg";
import SEOHead from "@/components/SEOHead";
import FilterBar from "@/components/FilterBar";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { useState, useEffect } from "react";

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

interface Categoria {
  uuid: string;
  nombre: string;
  icono: string;
}

interface Restaurante {
  uuid: string;
  nombre: string;
  descripcion: string;
  telefono?: string;
  imagen?: string;
  direccion: string;
  latitud: number;
  longitud: number;
  categoria: Categoria;
  horario?: string;
  calificacion_promedio?: number;
  total_calificaciones?: number;
}

const MapPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [searchParams] = useSearchParams();
  const [userPosition, setUserPosition] = useState<{ lat: number; lng: number } | null>(null);

  // Get filter params
  const searchQuery = searchParams.get('search') || '';
  const categoryQuery = searchParams.get('categoria')?.split(',').filter(Boolean) || [];
  const minRatingQuery = searchParams.get('min_rating') ? parseInt(searchParams.get('min_rating')!) : null;
  const distanceQuery = searchParams.get('radio') ? parseInt(searchParams.get('radio')!) : null;
  const latQuery = searchParams.get('lat');
  const lngQuery = searchParams.get('lng');

  // Get user geolocation
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setUserPosition({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      });
    }
  }, []);

  // Build query params
  const buildQueryParams = () => {
    const params: Record<string, any> = {};
    if (searchQuery) params.search = searchQuery;
    if (categoryQuery.length > 0) params.categoria = categoryQuery.join(',');
    if (minRatingQuery) params.min_rating = minRatingQuery;
    if (distanceQuery && latQuery && lngQuery) {
      params.lat = latQuery;
      params.lng = lngQuery;
      params.radio = distanceQuery;
    }
    return params;
  };

  const { data: restaurantes = [], isLoading } = useQuery({
    queryKey: ['restaurantes', searchQuery, categoryQuery, minRatingQuery, distanceQuery, latQuery, lngQuery],
    queryFn: async () => {
      const params = buildQueryParams();
      const res = await api.get('/restaurantes/', { params });
      return res.data;
    },
  });

  const handleLogout = async () => {
    logout();
    toast.success("Sesión cerrada");
    navigate("/");
  };

  const center: [number, number] =
    restaurantes.length > 0
      ? [Number(restaurantes[0].latitud), Number(restaurantes[0].longitud)]
      : userPosition
        ? [userPosition.lat, userPosition.lng]
        : [4.711, -74.0721];

  const itemListSchema = restaurantes.map((r, idx) => ({
    '@type': 'ListItem',
    'position': idx + 1,
    'url': `${import.meta.env.VITE_APP_URL || window.location.origin}/restaurante/${r.uuid}`,
    'name': r.nombre,
  }));

  const localBusinessSchema = restaurantes.map(r => ({
    '@type': 'LocalBusiness',
    'name': r.nombre,
    'description': r.descripcion,
    'address': {
      '@type': 'PostalAddress',
      'streetAddress': r.direccion,
    },
    'geo': {
      '@type': 'GeoCoordinates',
      'latitude': r.latitud,
      'longitude': r.longitud,
    },
    'telephone': r.telefono,
    'image': r.imagen,
    'servesCuisine': r.categoria?.nombre,
    ...(r.calificacion_promedio && {
      'aggregateRating': {
        '@type': 'AggregateRating',
        'ratingValue': r.calificacion_promedio,
        'reviewCount': r.total_calificaciones || 0,
      },
    }),
  }));

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEOHead
        title="Mapa de Restaurantes - FoodMap"
        description="Explora todos nuestros restaurantes en el mapa interactivo. Encuentra comida deliciosa cerca de ti con calificaciones y reseñas."
      />
      <SchemaOrg
        schema={{
          '@type': 'ItemList',
          'itemListElement': itemListSchema,
        }}
      />
      {localBusinessSchema.map((schema, idx) => (
        <SchemaOrg key={idx} schema={schema} />
      ))}

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
            {user && (
              <span className="text-sm font-medium text-foreground hidden sm:inline">
                Hola, {user.email}
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

      <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
        {/* Filter Panel */}
        <div className="md:w-80 bg-card border-r overflow-y-auto p-4 flex flex-col gap-4">
          <FilterBar
            userPosition={userPosition || undefined}
            resultsCount={restaurantes.length}
          />
        </div>

        {/* Map */}
        <div className="flex-1 relative">
          {isLoading ? (
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
                  key={restaurante.uuid}
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
                      {restaurante.calificacion_promedio && restaurante.calificacion_promedio > 0 && (
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
    </div>
  );
};

export default MapPage;