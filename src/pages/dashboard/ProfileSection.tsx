import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { Upload } from 'lucide-react';

const profileSchema = z.object({
  nombre: z.string().min(2, "El nombre es requerido"),
  descripcion: z.string().optional(),
  telefono: z.string().optional(),
  horario: z.string().optional(),
  imagen: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface ProfileSectionProps {
  onCompletenessChange: (value: number) => void;
}

const ProfileSection = ({ onCompletenessChange }: ProfileSectionProps) => {
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const { data: restaurante, isLoading } = useQuery({
    queryKey: ['restaurante-profile'],
    queryFn: async () => {
      const res = await api.get('/restaurantes/mi-local/');
      return res.data;
    },
  });

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset, watch } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    values: restaurante ? {
      nombre: restaurante.nombre || '',
      descripcion: restaurante.descripcion || '',
      telefono: restaurante.telefono || '',
      horario: restaurante.horario || '',
      imagen: restaurante.imagen || '',
    } : undefined,
  });

  const updateMutation = useMutation({
    mutationFn: (data: ProfileFormValues) =>
      api.patch('/restaurantes/mi-local/', data),
    onSuccess: () => {
      toast.success("Perfil actualizado correctamente");
      // Calculate completeness
      const filled = Object.values(watch()).filter(v => v && v.toString().trim().length > 0).length;
      onCompletenessChange(Math.round((filled / 5) * 100));
    },
    onError: () => {
      toast.error("Error al actualizar el perfil");
    },
  });

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await api.post('/upload/image/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const imageUrl = res.data.url;
      setImagePreview(imageUrl);
      // Update form value but don't submit yet
      reset({ ...watch(), imagen: imageUrl });
    } catch {
      toast.error("Error al cargar la imagen");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const onSubmit = (data: ProfileFormValues) => {
    updateMutation.mutate(data);
  };

  if (isLoading) {
    return <div className="text-center text-muted-foreground">Cargando perfil...</div>;
  }

  return (
    <Card className="p-8 max-w-2xl">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Image Upload */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Logo del Restaurante</Label>
          {(imagePreview || restaurante?.imagen) && (
            <img
              src={imagePreview || restaurante?.imagen}
              alt="Restaurant"
              className="w-32 h-32 object-cover rounded-lg border"
            />
          )}
          <div className="flex items-center gap-2">
            <label className="cursor-pointer flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-muted transition-colors">
              <Upload className="w-4 h-4" />
              <span className="text-sm">Subir imagen</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                disabled={isUploadingImage}
                className="hidden"
              />
            </label>
            {isUploadingImage && <span className="text-xs text-muted-foreground">Subiendo...</span>}
          </div>
        </div>

        {/* Nombre */}
        <div className="space-y-2">
          <Label htmlFor="nombre">Nombre del Restaurante *</Label>
          <Input
            id="nombre"
            placeholder="Ej: La Comida Deliciosa"
            {...register('nombre')}
          />
          {errors.nombre && <p className="text-sm text-destructive">{errors.nombre.message}</p>}
        </div>

        {/* Descripción */}
        <div className="space-y-2">
          <Label htmlFor="descripcion">Descripción</Label>
          <Textarea
            id="descripcion"
            placeholder="Describe tu restaurante, especialidades, ambiente..."
            className="min-h-24"
            {...register('descripcion')}
          />
          {errors.descripcion && <p className="text-sm text-destructive">{errors.descripcion.message}</p>}
        </div>

        {/* Teléfono */}
        <div className="space-y-2">
          <Label htmlFor="telefono">Teléfono</Label>
          <Input
            id="telefono"
            placeholder="Ej: +57 1234567890"
            {...register('telefono')}
          />
          {errors.telefono && <p className="text-sm text-destructive">{errors.telefono.message}</p>}
        </div>

        {/* Horario */}
        <div className="space-y-2">
          <Label htmlFor="horario">Horario</Label>
          <Input
            id="horario"
            placeholder="Ej: Lun-Sáb: 11:00 AM - 10:00 PM"
            {...register('horario')}
          />
          {errors.horario && <p className="text-sm text-destructive">{errors.horario.message}</p>}
        </div>

        <Button type="submit" disabled={isSubmitting || updateMutation.isPending}>
          {isSubmitting || updateMutation.isPending ? 'Guardando...' : 'Guardar Perfil'}
        </Button>
      </form>
    </Card>
  );
};

export default ProfileSection;
