import { useQuery, keepPreviousData } from '@tanstack/react-query';

const API_URL = "http://127.0.0.1:8000/api";
const OVERPASS_URL = "https://overpass-api.de/api/interpreter";

/**
 * Hook para obtener los restaurantes de nuestra propia base de datos.
 * Implementa caché agresiva para evitar cargas constantes.
 */
export const useLocalRestaurants = () => {
  return useQuery({
    queryKey: ['local-restaurants'],
    queryFn: async () => {
      try {
        const response = await fetch(`${API_URL}/restaurantes/`);
        if (!response.ok) throw new Error('Error backend');
        return await response.json();
      } catch (err) {
        console.error("Error fetching local restaurants:", err);
        return [];
      }
    },
    staleTime: 1000 * 60 * 30, // 30 minutos de caché
    gcTime: 1000 * 60 * 60,    // Mantener 1 hora en memoria
    refetchOnWindowFocus: false,
  });
};

/**
 * Hook para obtener puntos de comida desde OpenStreetMap usando Overpass API.
 * Filtra por el Bounding Box (bbox) proporcionado.
 */
export const useOsmRestaurants = (bboxString) => {
  return useQuery({
    queryKey: ['osm-food-points', bboxString],
    queryFn: async () => {
      if (!bboxString) return [];
      
      const query = `
        [out:json][timeout:25];
        (
          node["amenity"~"restaurant|cafe|fast_food|bar|pub|food_court|ice_cream"](${bboxString});
          way["amenity"~"restaurant|cafe|fast_food|bar|pub|food_court|ice_cream"](${bboxString});
          relation["amenity"~"restaurant|cafe|fast_food|bar|pub|food_court|ice_cream"](${bboxString});
        );
        out center;
      `;
      
      try {
        const response = await fetch(`${OVERPASS_URL}?data=${encodeURIComponent(query)}`);
        if (!response.ok) throw new Error('Overpass Error');
        const data = await response.json();
        
        return data.elements
          .map(el => {
            const lat = el.lat || el.center?.lat;
            const lon = el.lon || el.center?.lon;
            if (!lat || !lon) return null;

            const tags = el.tags || {};
            const cuisine = (tags.cuisine || "").toLowerCase();
            const amenity = (tags.amenity || "").toLowerCase();

            let category = 'Restaurante';
            
            // Lógica de detección inteligente por cocina o tipo
            if (cuisine.includes('pizza')) category = 'Pizza';
            else if (cuisine.includes('burger') || cuisine.includes('hamburger')) category = 'Hamburguesa';
            else if (cuisine.includes('seafood') || cuisine.includes('fish')) category = 'Pescados';
            else if (cuisine.includes('sushi') || cuisine.includes('japanese')) category = 'Sushi';
            else if (amenity === 'cafe') category = 'Café';
            else if (amenity === 'fast_food') category = 'Comida Rápida';
            else if (amenity === 'bar' || amenity === 'pub') category = 'Bar/Pub';

            return {
              id: `osm-${el.id}`,
              name: tags.name || 'Local de comida',
              category: category,
              lat: lat,
              lng: lon,
              isOsm: true,
              rating: 4.2,
              thumbnail: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=200"
            };
          }).filter(Boolean);

      } catch (err) {
        console.error("Error fetching OSM restaurants:", err);
        return [];
      }
    },
    enabled: !!bboxString,
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5, // 5 minutos por zona
    gcTime: 1000 * 60 * 30,   // 30 minutos de memoria
  });
};
