import React, { useState, useMemo, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMapEvents } from 'react-leaflet';
import { Star, MapPin, ExternalLink, Loader2, Globe, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { getCategoryIcons } from './icons';

import { useLocalRestaurants, useOsmRestaurants } from '@/hooks/useRestaurants';
import 'leaflet/dist/leaflet.css';








// Componente para manejar eventos del mapa con optimización
const MapEvents = ({ onBoundsChange, onZoomChange }) => {
  const map = useMapEvents({
    moveend: () => {
      const b = map.getBounds();
      
      // Implementación de BUFFER: Pedimos un 10% más de lo que se ve
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
    const b = map.getBounds();
    const bbox = [b.getSouth(), b.getWest(), b.getNorth(), b.getEast()].join(',');
    onBoundsChange(bbox);
    onZoomChange(map.getZoom());
  }, []);

  return null;
};

const MapView = () => {
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [bboxString, setBboxString] = useState(null);
  const [currentZoom, setCurrentZoom] = useState(15);
  const [searchTerm, setSearchTerm] = useState('');


  // 1. Fetch de nuestros restaurantes (Base de datos local)
  const { data: localRestaurants = [] } = useLocalRestaurants();

  // 2. Fetch de Overpass API (OpenStreetMap)
  const { data: osmRestaurants = [], isFetching: loadingOsm } = useOsmRestaurants(bboxString);



  // Combinar y filtrar
  const allRestaurants = useMemo(() => {
    let combined = [...localRestaurants, ...osmRestaurants];
    
    // Filtrar por búsqueda
    if (searchTerm) {
      combined = combined.filter(res => 
        (res.name || res.nombre || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (activeCategory === 'Todos') return combined;
    if (activeCategory === 'Explorar') return osmRestaurants;
    return combined.filter(res => {
      const catName = typeof res.category === 'string' ? res.category : res.categoria?.nombre;
      return catName === activeCategory;
    });
  }, [localRestaurants, osmRestaurants, activeCategory, searchTerm]);

  // Calcular tamaño de icono basado en zoom
  const iconSize = useMemo(() => {
    if (currentZoom >= 17) return 60;
    if (currentZoom >= 14) return 40;
    return 25;
  }, [currentZoom]);

  const categoryIcons = useMemo(() => getCategoryIcons(iconSize), [iconSize]);



  const categories = ['Todos', 'Pizza', 'Hamburguesa', 'Pescados', 'Explorar'];

  return (
    <section className="flex flex-col gap-4 w-full h-full min-h-[700px]">
      
      {/* Filtros y Buscador */}
      <div className="flex flex-col md:flex-row items-center gap-4 justify-between">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide w-full md:w-auto">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all whitespace-nowrap ${
                activeCategory === cat 
                  ? 'bg-primary border-primary text-primary-foreground shadow-md' 
                  : 'bg-card border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
              }`}
            >
              {cat === 'Explorar' ? <span className="flex items-center gap-1"><Globe size={14}/> Otros</span> : cat}
            </button>
          ))}
        </div>
        
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar restaurante..." 
            className="pl-9 bg-card border-border focus-visible:ring-primary h-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {loadingOsm && <Loader2 className="w-5 h-5 animate-spin text-primary" />}
      </div>


      {/* Mapa */}
      <div className="h-[600px] w-full rounded-2xl overflow-hidden border border-border shadow-2xl relative z-10 bg-muted/20">
        <style dangerouslySetInnerHTML={{ __html: `
          .leaflet-tooltip-google {
            background-color: transparent !important;
            border: none !important;
            box-shadow: none !important;
            color: #3c4043 !important;
            font-weight: 600 !important;
            font-size: ${currentZoom > 14 ? '11px' : '9px'} !important;
            text-shadow: 
              -1px -1px 0 #fff,  
               1px -1px 0 #fff,
              -1px  1px 0 #fff,
               1px  1px 0 #fff,
               0px 1px 2px rgba(0,0,0,0.2) !important;
            padding: 0 !important;
            white-space: nowrap !important;
            transition: font-size 0.2s ease;
          }
          .leaflet-tooltip-left:before, .leaflet-tooltip-right:before {
            display: none !important;
          }
        `}} />
        
        <MapContainer 
          center={[3.8828, -77.0316]} 
          zoom={15} 
          scrollWheelZoom={true}
          style={{ height: "600px", width: "100%" }}
          className="z-0"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          <MapEvents 
            onBoundsChange={setBboxString} 
            onZoomChange={setCurrentZoom}
          />

          {allRestaurants.map((res) => {

              const lat = res.lat || res.latitud;
              const lng = res.lng || res.longitud;
              const catName = typeof res.category === 'string' ? res.category : res.categoria?.nombre;
              
              if (!lat || !lng) return null;

              return (
                <Marker 
                  key={res.id} 
                  position={[Number(lat), Number(lng)]}
                  icon={categoryIcons[catName] || categoryIcons.Default}
                >
                  <Tooltip 
                    permanent 
                    direction="right" 
                    offset={[15, 0]} 
                    className="leaflet-tooltip-google"
                  >
                    {res.name || res.nombre}
                  </Tooltip>
                  
                  <Popup>
                    <div className="min-w-[200px] font-sans p-1">
                      <img 
                        src={res.thumbnail || res.imagen} 
                        alt={res.name || res.nombre} 
                        className="w-full h-28 object-cover rounded-md mb-2 shadow-sm" 
                      />
                      <div className="px-1">
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-slate-900 text-sm m-0 leading-tight">
                            {res.name || res.nombre}
                          </h4>
                        </div>
                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter m-0 mt-0.5">
                          {catName}
                        </p>
                        
                        <div className="flex items-center gap-1 my-1.5">
                          <Star size={12} className="text-yellow-500 fill-yellow-500" />
                          <span className="text-xs font-bold text-slate-700">
                            {res.rating || res.calificacion_promedio || '4.0'}
                          </span>
                        </div>

                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            if (res.isOsm) {
                              window.open(`https://www.openstreetmap.org/${res.id.replace('osm-', 'node/')}`, '_blank');
                            } else {
                              window.location.href = `/restaurante/${res.id}`;
                            }
                          }}
                          className="w-full mt-2 bg-primary text-primary-foreground text-[11px] py-2 rounded-md font-bold flex items-center justify-center gap-1 hover:opacity-90 transition-opacity"
                        >
                          Ver más <ExternalLink size={12} />
                        </button>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}






        </MapContainer>
      </div>
    </section>
  );
};

export default MapView;
