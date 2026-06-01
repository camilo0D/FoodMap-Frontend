import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMapEvents, Polyline } from 'react-leaflet';
import { Star, ExternalLink, Loader2, Globe, Search, Navigation, AlertTriangle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { getCategoryIcons } from './icons';
import { useLocalRestaurants, useOsmRestaurants } from '@/hooks/useRestaurants';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Subtarea: Fórmula Haversine en JS para calcular distancia en km
const calculateHaversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radio de la Tierra en km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Función para obtener la imagen del restaurante con hermosos fallbacks de Unsplash
const getRestaurantCoverImage = (res) => {
  if (res.imagen && res.imagen.startsWith('http')) return res.imagen;
  if (res.thumbnail && res.thumbnail.startsWith('http')) return res.thumbnail;
  
  const cat = (typeof res.categoria === 'string' ? res.categoria : res.categoria?.nombre || res.category || '').toLowerCase();
  
  if (cat.includes('pizza')) {
    return 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=80';
  }
  if (cat.includes('hamburguesa') || cat.includes('comida rápida') || cat.includes('rapida') || cat.includes('perros') || cat.includes('asados')) {
    return 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=80';
  }
  if (cat.includes('café') || cat.includes('cafe') || cat.includes('panadería') || cat.includes('dulce')) {
    return 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=500&auto=format&fit=crop&q=80';
  }
  if (cat.includes('marisco') || cat.includes('pescado') || cat.includes('pacífico') || cat.includes('ceviche') || cat.includes('mar')) {
    return 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=500&auto=format&fit=crop&q=80';
  }
  
  // Default fallback premium food image
  return 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500&auto=format&fit=crop&q=80';
};

// Función para generar el marcador de usuario dinámico (FOOD-008)
const getUserLocationIcon = (size = 24) => {
  const containerSize = size * 3; // Círculo de precisión un poco más ajustado
  return L.divIcon({
    className: 'custom-user-icon',
    html: `
      <div style="width: ${containerSize}px; height: ${containerSize}px;" class="relative flex items-center justify-center">
        <!-- Área de precisión (círculo azul claro transparente) -->
        <div class="absolute h-full w-full rounded-full" style="background-color: rgba(66, 133, 244, 0.15); border: 1px solid rgba(66, 133, 244, 0.3);"></div>
        <!-- Punto azul central con borde blanco -->
        <div style="width: ${size}px; height: ${size}px; background-color: #4285F4; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.4);" class="relative rounded-full"></div>
      </div>
    `,
    iconSize: [containerSize, containerSize],
    iconAnchor: [containerSize / 2, containerSize / 2]
  });
};

// Componente para manejar eventos y controlador de centrado (FOOD-008)
const MapController = ({ onBoundsChange, onZoomChange, userPosition, shouldRecenter, setShouldRecenter }) => {
  const map = useMapEvents({
    moveend: () => {
      const b = map.getBounds();
      const latBuffer = (b.getNorth() - b.getSouth()) * 0.1;
      const lngBuffer = (b.getEast() - b.getWest()) * 0.1;
      const precision = 4;
      const bbox = [
        (b.getSouth() - latBuffer).toFixed(precision),
        (b.getWest() - lngBuffer).toFixed(precision),
        (b.getNorth() + latBuffer).toFixed(precision),
        (b.getEast() + lngBuffer).toFixed(precision)
      ].join(',');
      onBoundsChange(bbox);
      onZoomChange(map.getZoom());
    },
  });

  useEffect(() => {
    if (userPosition && shouldRecenter) {
      map.flyTo([userPosition.lat, userPosition.lng], 15, {
        animate: true,
        duration: 1.5
      });
      setShouldRecenter(false);
    }
  }, [userPosition, shouldRecenter, map, setShouldRecenter]);

  useEffect(() => {
    const b = map.getBounds();
    const bbox = [b.getSouth(), b.getWest(), b.getNorth(), b.getEast()].join(',');
    onBoundsChange(bbox);
    onZoomChange(map.getZoom());
  }, []);

  return null;
};

const MapView = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [bboxString, setBboxString] = useState(null);
  const [currentZoom, setCurrentZoom] = useState(13);
  const [searchTerm, setSearchTerm] = useState('');
  const [userPosition, setUserPosition] = useState(null);
  const [shouldRecenter, setShouldRecenter] = useState(false);
  const [geoError, setGeoError] = useState(null);
  const [routePoints, setRoutePoints] = useState(null);

  const { data: localRestaurants = [] } = useLocalRestaurants();
  // Deshabilitado el uso de OSM para mostrar solo restaurantes del backend
  const osmRestaurants = [];
  const loadingOsm = false;

  // Tracking de geolocalización (FOOD-008 Optimizado)
  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoError('Tu navegador no soporta geolocalización.');
      return;
    }

    // Captura inicial rápida
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserPosition(coords);
        setShouldRecenter(true);
      },
      null,
      { enableHighAccuracy: true, timeout: 5000 }
    );

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setUserPosition({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setGeoError(null);
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setGeoError('Permiso denegado. Activa la ubicación en el navegador.');
        } else {
          setGeoError('Error obteniendo ubicación.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  const calculateRoute = async (destLat, destLng) => {
    if (!userPosition) return;
    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${userPosition.lng},${userPosition.lat};${destLng},${destLat}?overview=full&geometries=geojson`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.routes?.[0]) {
        const coordinates = data.routes[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
        setRoutePoints(coordinates);
      }
    } catch (err) {
      console.error("Error calculando ruta:", err);
    }
  };

  const allRestaurants = useMemo(() => {
    let combined = [...localRestaurants, ...osmRestaurants].map(res => {
      const lat = res.lat || res.latitud;
      const lng = res.lng || res.longitud;
      if (userPosition && lat && lng) {
        const distance = calculateHaversineDistance(userPosition.lat, userPosition.lng, Number(lat), Number(lng));
        return { ...res, distance };
      }
      return { ...res, distance: null };
    });
    
    if (searchTerm) {
      combined = combined.filter(res => (res.name || res.nombre || '').toLowerCase().includes(searchTerm.toLowerCase()));
    }

    let filtered = combined;
    if (activeCategory !== 'Todos') {
      if (activeCategory === 'Explorar') {
        filtered = osmRestaurants;
      } else {
        filtered = combined.filter(res => {
          const catName = typeof res.category === 'string' ? res.category : res.categoria?.nombre;
          return catName === activeCategory;
        });
      }
    }

    if (userPosition) {
      filtered.sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
    }
    return filtered;
  }, [localRestaurants, osmRestaurants, activeCategory, searchTerm, userPosition]);

  const iconSize = useMemo(() => {
    // Escalado suave: aumenta 8px por cada nivel de zoom por encima de 10
    const baseSize = (currentZoom - 10) * 8;
    return Math.max(16, Math.min(70, baseSize));
  }, [currentZoom]);

  const categoryIcons = useMemo(() => getCategoryIcons(iconSize), [iconSize]);
  const userIcon = useMemo(() => getUserLocationIcon(iconSize * 0.45), [iconSize]); // Usuario con tamaño más delicado

  return (
    <section className="flex flex-col gap-4 w-full h-[calc(100vh-100px)]">
      <div className="flex items-center gap-3 w-full">
        
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
            <Search className="w-5 h-5 text-muted-foreground" />
          </div>
          <Input 
            placeholder="Buscar restaurante..." 
            className="pl-10 bg-card border-border h-11 w-full text-base shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {loadingOsm && <Loader2 className="w-6 h-6 animate-spin text-primary shrink-0" />}

        {routePoints && (
          <button
            onClick={() => setRoutePoints(null)}
            className="shrink-0 bg-red-100 border-2 border-red-200 text-red-600 hover:bg-red-600 hover:text-white px-5 h-11 rounded-md font-bold text-sm shadow-sm transition-all flex items-center"
          >
            Limpiar Ruta
          </button>
        )}
      </div>

      {geoError && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-2 rounded-lg flex items-center gap-2 text-sm">
          <AlertTriangle size={16} /> <p>{geoError}</p>
        </div>
      )}

      <div className="w-full rounded-2xl overflow-hidden border border-border shadow-2xl relative z-10 bg-muted/20" style={{ height: "calc(100vh - 160px)" }}>
        <style dangerouslySetInnerHTML={{ __html: `
          .leaflet-tooltip-google {
            background-color: transparent !important;
            border: none !important;
            box-shadow: none !important;
            color: #3c4043 !important;
            font-weight: 600 !important;
            font-size: ${currentZoom > 14 ? '11px' : '9px'} !important;
            text-shadow: -1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff, 1px 1px 0 #fff, 0px 1px 2px rgba(0,0,0,0.2) !important;
            padding: 0 !important; white-space: nowrap !important;
          }
          .leaflet-tooltip-left:before, .leaflet-tooltip-right:before { display: none !important; }
          .leaflet-popup-content-wrapper {
            background: rgba(255, 255, 255, 0.95) !important;
            backdrop-filter: blur(16px) !important;
            border: 1px solid rgba(226, 232, 240, 0.8) !important;
            border-radius: 20px !important;
            box-shadow: 0 20px 40px -15px rgba(0,0,0,0.15) !important;
            overflow: hidden !important;
          }
          .leaflet-popup-content {
            margin: 0 !important;
            width: 240px !important;
          }
          .leaflet-popup-tip-container {
            margin-top: -1px !important;
          }
          .leaflet-popup-tip {
            background: rgba(255, 255, 255, 0.95) !important;
            box-shadow: 0 10px 20px rgba(0,0,0,0.05) !important;
            border: 1px solid rgba(226, 232, 240, 0.8) !important;
          }
          .leaflet-container a.leaflet-popup-close-button {
            top: 12px !important;
            right: 12px !important;
            color: #ffffff !important;
            background: rgba(15, 23, 42, 0.5) !important;
            width: 24px !important;
            height: 24px !important;
            border-radius: 9999px !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            font-size: 14px !important;
            line-height: 24px !important;
            font-weight: bold !important;
            z-index: 1000 !important;
            transition: all 0.2s ease !important;
            box-shadow: 0 2px 8px rgba(0,0,0,0.15) !important;
            border: 1px solid rgba(255,255,255,0.2) !important;
          }
          .leaflet-container a.leaflet-popup-close-button:hover {
            background: rgba(239, 68, 68, 0.9) !important;
            transform: scale(1.05) !important;
          }
        `}} />
        
        <MapContainer center={[4.711, -74.0721]} zoom={currentZoom} scrollWheelZoom={true} style={{ height: "calc(100vh - 160px)", width: "100%" }} className="z-0">
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap contributors' />
          <MapController onBoundsChange={setBboxString} onZoomChange={setCurrentZoom} userPosition={userPosition} shouldRecenter={shouldRecenter} setShouldRecenter={setShouldRecenter} />

          {routePoints && <Polyline positions={routePoints} color="#6366f1" weight={5} opacity={0.8} dashArray="1, 10" className="animate-pulse" />}

          {userPosition && (
            <Marker position={[userPosition.lat, userPosition.lng]} icon={userIcon} zIndexOffset={1000}>
              <Popup className="text-xs font-bold">¡Estás aquí!</Popup>
            </Marker>
          )}

          {allRestaurants.map((res) => {
            const lat = res.lat || res.latitud;
            const lng = res.lng || res.longitud;
            const catName = typeof res.category === 'string' ? res.category : res.categoria?.nombre;
            if (!lat || !lng) return null;
            return (
              <Marker key={res.id} position={[Number(lat), Number(lng)]} icon={categoryIcons[catName] || categoryIcons.Default}>
                <Tooltip permanent direction="right" offset={[15, 0]} className="leaflet-tooltip-google">{res.name || res.nombre}</Tooltip>
                <Popup>
                  <div className="w-[240px] font-sans overflow-hidden bg-white text-slate-900 rounded-2xl flex flex-col">
                    {/* Header Image with overlay */}
                    <div className="relative w-full h-28 bg-slate-900 overflow-hidden shrink-0">
                      <img 
                        src={getRestaurantCoverImage(res)} 
                        alt={res.name || res.nombre} 
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" 
                      />
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-black/10 pointer-events-none" />
                      
                      {/* Category Badge on top of image */}
                      <span className="absolute bottom-2 left-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-primary text-primary-foreground border border-primary/20 shadow-sm">
                        {catName}
                      </span>
                    </div>

                    {/* Content Section */}
                    <div className="p-3.5 space-y-2.5 flex-1">
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-sm leading-tight tracking-tight m-0 hover:text-primary transition-colors">
                          {res.name || res.nombre}
                        </h4>
                        {res.direccion && (
                          <p className="text-[9px] text-slate-500 font-medium m-0 mt-0.5 truncate">
                            {res.direccion}
                          </p>
                        )}
                      </div>

                      {/* Ratings and Distance */}
                      <div className="flex items-center gap-3.5 text-[11px] font-bold border-t border-b border-slate-100 py-1.5">
                        {/* Rating */}
                        <div className="flex items-center gap-0.5 text-slate-700">
                          <Star size={12} className="text-amber-500 fill-amber-500" />
                          <span>
                            {res.calificacion_promedio && Number(res.calificacion_promedio) > 0 
                              ? Number(res.calificacion_promedio).toFixed(1) 
                              : "4.8"}
                          </span>
                          <span className="text-[9px] text-slate-400 font-normal">
                            ({res.total_calificaciones || 14})
                          </span>
                        </div>

                        {/* Distance */}
                        {res.distance !== null && (
                          <div className="flex items-center gap-1 text-indigo-600">
                            <span className="w-1 h-1 rounded-full bg-indigo-500 animate-pulse" />
                            <span>{res.distance.toFixed(2)} km</span>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-1.5 pt-0.5">
                        <button 
                          onClick={(e) => { e.stopPropagation(); calculateRoute(lat, lng); }} 
                          className="flex-1 bg-indigo-600 text-white text-[10px] py-1.5 rounded-lg font-bold flex items-center justify-center gap-1 hover:bg-indigo-700 active:scale-95 transition-all shadow-sm hover:shadow-md"
                        >
                          <Navigation size={10} className="fill-current" /> 
                          Ruta
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); navigate(`/restaurante/${res.id}`); }} 
                          className="flex-1 bg-slate-50 border border-slate-200 text-slate-700 text-[10px] py-1.5 rounded-lg font-bold flex items-center justify-center gap-0.5 hover:bg-slate-100 active:scale-95 transition-all"
                        >
                          Detalles
                          <ExternalLink size={10} />
                        </button>
                      </div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>

        <button
          onClick={() => {
            if (userPosition) { setShouldRecenter(true); } 
            else { navigator.geolocation.getCurrentPosition((pos) => { setUserPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setShouldRecenter(true); }); }
          }}
          className={`absolute bottom-6 right-6 z-[1000] p-3 rounded-full shadow-2xl transition-all active:scale-95 ${userPosition ? 'bg-primary text-primary-foreground hover:scale-110' : 'bg-muted text-muted-foreground animate-pulse'}`}
          title="Centrar en mi ubicación"
        >
          <Navigation size={20} className={userPosition ? 'fill-current' : ''} />
        </button>

      </div>
    </section>
  );
};

export default MapView;
