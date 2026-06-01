import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Star } from 'lucide-react';

interface Review {
  uuid: string;
  usuario_nombre: string;
  calificacion: number;
  comentario: string;
  created_at: string;
}

const ReviewsSection = () => {
  const { data: response, isLoading } = useQuery({
    queryKey: ['reviews'],
    queryFn: async () => {
      const res = await api.get('/restaurantes/mi-local/resenas/');
      return res.data;
    },
  });

  const reviews: Review[] = Array.isArray(response) ? response : response?.results || [];
  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.calificacion, 0) / reviews.length).toFixed(1)
    : 0;

  if (isLoading) {
    return <div className="text-center text-muted-foreground">Cargando reseñas...</div>;
  }

  return (
    <Card className="p-8">
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Reseñas Recibidas</h3>
        <div className="flex items-center gap-4">
          <div className="text-4xl font-bold">{averageRating}</div>
          <div className="flex gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-6 h-6 ${
                  i < Math.round(parseFloat(averageRating as string))
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-muted-foreground'
                }`}
              />
            ))}
          </div>
          <div className="text-muted-foreground">
            {reviews.length} {reviews.length === 1 ? 'reseña' : 'reseñas'}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {reviews.map((review) => (
          <Card key={review.uuid} className="p-4 border bg-muted/50">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-semibold">{review.usuario_nombre}</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(review.created_at).toLocaleDateString('es-CO')}
                </p>
              </div>
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < review.calificacion
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-muted-foreground'
                    }`}
                  />
                ))}
              </div>
            </div>
            {review.comentario && (
              <p className="text-sm text-foreground">{review.comentario}</p>
            )}
          </Card>
        ))}
      </div>

      {reviews.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          Aún no hay reseñas. ¡Los clientes comenzarán a calificar pronto!
        </div>
      )}
    </Card>
  );
};

export default ReviewsSection;
