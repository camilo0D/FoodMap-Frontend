import L from 'leaflet';

// Función para generar iconos estilo Google Maps (Círculo rojo con utensilios)
// Función para generar iconos estilo Google Maps con tamaño dinámico
export const getCategoryIcons = (size = 45) => {
  const createIcon = (color = '#EA4335') => {
    return L.divIcon({
      html: `
        <div style="
          background-color: ${color};
          width: ${size}px;
          height: ${size}px;
          border-radius: 50%;
          border: ${size / 15}px solid white;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 ${size / 10}px ${size / 5}px rgba(0,0,0,0.4);
          transition: all 0.2s ease-out;
        ">
          <svg xmlns="http://www.w3.org/2000/svg" width="${size * 0.55}" height="${size * 0.55}" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"></path>
            <path d="M7 2v20"></path>
            <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"></path>
          </svg>
        </div>
      `,
      className: 'custom-google-icon',
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
      popupAnchor: [0, -size / 2]
    });
  };

  return {
    "Pizza": createIcon('#EA4335'),
    "Hamburguesa": createIcon('#F4B400'),
    "Pescados": createIcon('#4285F4'),
    "Sushi": createIcon('#DB4437'),
    "Café": createIcon('#964B00'),
    "Bar/Pub": createIcon('#673AB7'),
    "Comida Rápida": createIcon('#FF5722'),
    "OSM": createIcon('#34A853'),
    "Default": createIcon('#EA4335')
  };
};


