import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { MapPin } from 'lucide-react';

const LocationSection = () => {
  const [lat, setLat] = useState(4.711);
  const [lng, setLng] = useState(-74.0721);
  const [isEditing, setIsEditing] = useState(false);

  const { data: restaurante, isLoading } = useQuery({
    queryKey: ['restaurante-location'],
    queryFn: async () => {
      const res = await api.get('/restaurantes/mi-local/');
      return res.data;
    },
    onSuccess: (data) => {
      if (data.latitud) setLat(data.latitud);
      if (data.longitud) setLng(data.longitud);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: { latitud: number; longitud: number }) =>
      api.patch('/restaurantes/mi-local/', data),
    onSuccess: () => {
      toast.success("Ubicación actualizada correctamente");
      setIsEditing(false);
    },
    onError: () => {
      toast.error("Error al actualizar la ubicación");
    },
  });

  const handleSaveLocation = () => {
    updateMutation.mutate({ latitud: lat, longitud: lng });
  };

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setLat(position.coords.latitude);
        setLng(position.coords.longitude);
        toast.success("Ubicación obtenida. Guarda los cambios para confirmar.");
      });
    } else {
      toast.error("Geolocalización no disponible en tu navegador");
    }
  };

  if (isLoading) {
    return <div className="text-center text-muted-foreground">Cargando ubicación...</div>;
  }

  return (
    <Card className="p-8 max-w-2xl space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Ubicación del Restaurante
        </h3>
        <p className="text-sm text-muted-foreground">Edita las coordenadas de tu restaurante para que aparezca correctamente en el mapa</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="lat">Latitud</Label>
          <Input
            id="lat"
            type="number"
            step="0.0001"
            value={lat}
            onChange={(e) => setLat(parseFloat(e.target.value))}
            disabled={!isEditing}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lng">Longitud</Label>
          <Input
            id="lng"
            type="number"
            step="0.0001"
            value={lng}
            onChange={(e) => setLng(parseFloat(e.target.value))}
            disabled={!isEditing}
          />
        </div>
      </div>

      <div className="bg-muted p-4 rounded-lg text-sm">
        <p className="font-medium mb-2">Ubicación actual:</p>
        <p className="text-muted-foreground">
          Latitud: {lat.toFixed(6)} | Longitud: {lng.toFixed(6)}
        </p>
        {restaurante?.direccion && (
          <p className="text-muted-foreground mt-2">
            📍 {restaurante.direccion}
          </p>
        )}
      </div>

      <div className="flex gap-3 flex-wrap">
        <Button
          variant="outline"
          onClick={handleGetCurrentLocation}
        >
          Usar Mi Ubicación Actual
        </Button>
        <Button
          variant={isEditing ? 'default' : 'outline'}
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? 'Cancelar' : 'Editar Coordenadas'}
        </Button>
        {isEditing && (
          <Button
            onClick={handleSaveLocation}
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? 'Guardando...' : 'Guardar Ubicación'}
          </Button>
        )}
      </div>

      <div className="text-xs text-muted-foreground bg-muted p-3 rounded-lg">
        💡 Tip: Puedes obtener las coordenadas exactas buscando tu restaurante en Google Maps y copiando la latitud y longitud de la URL.
      </div>
    </Card>
  );
};

export default LocationSection;
