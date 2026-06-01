import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Trash2, Edit2 } from 'lucide-react';

const dishSchema = z.object({
  nombre: z.string().min(2, "El nombre es requerido"),
  descripcion: z.string().optional(),
  precio: z.number().min(0, "El precio debe ser mayor a 0"),
  disponible: z.boolean().default(true),
});

type DishFormValues = z.infer<typeof dishSchema>;

interface Dish {
  uuid: string;
  nombre: string;
  descripcion?: string;
  precio: number;
  disponible: boolean;
}

const MenuSection = () => {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDish, setEditingDish] = useState<Dish | null>(null);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<DishFormValues>({
    resolver: zodResolver(dishSchema),
    defaultValues: editingDish || { disponible: true },
  });

  const { data: dishes = [], isLoading } = useQuery({
    queryKey: ['menu'],
    queryFn: async () => {
      const res = await api.get('/restaurantes/mi-local/menu/');
      return res.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: DishFormValues) =>
      api.post('/restaurantes/mi-local/menu/', data),
    onSuccess: () => {
      toast.success("Plato agregado correctamente");
      queryClient.invalidateQueries({ queryKey: ['menu'] });
      setDialogOpen(false);
      reset();
    },
    onError: () => {
      toast.error("Error al agregar el plato");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: DishFormValues }) =>
      api.put(`/restaurantes/mi-local/menu/${id}/`, data),
    onSuccess: () => {
      toast.success("Plato actualizado correctamente");
      queryClient.invalidateQueries({ queryKey: ['menu'] });
      setDialogOpen(false);
      setEditingDish(null);
      reset();
    },
    onError: () => {
      toast.error("Error al actualizar el plato");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      api.delete(`/restaurantes/mi-local/menu/${id}/`),
    onSuccess: () => {
      toast.success("Plato eliminado correctamente");
      queryClient.invalidateQueries({ queryKey: ['menu'] });
    },
    onError: () => {
      toast.error("Error al eliminar el plato");
    },
  });

  const onSubmit = (data: DishFormValues) => {
    if (editingDish) {
      updateMutation.mutate({ id: editingDish.uuid, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (dish: Dish) => {
    setEditingDish(dish);
    reset({
      nombre: dish.nombre,
      descripcion: dish.descripcion,
      precio: dish.precio,
      disponible: dish.disponible,
    });
    setDialogOpen(true);
  };

  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setEditingDish(null);
      reset();
    }
  };

  if (isLoading) {
    return <div className="text-center text-muted-foreground">Cargando menú...</div>;
  }

  return (
    <Card className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Mi Menú</h3>
        <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
          <DialogTrigger asChild>
            <Button>Agregar Plato</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingDish ? 'Editar Plato' : 'Agregar Plato'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre *</Label>
                <Input id="nombre" placeholder="Ej: Ceviche de camarón" {...register('nombre')} />
                {errors.nombre && <p className="text-sm text-destructive">{errors.nombre.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea id="descripcion" placeholder="Descripción del plato..." {...register('descripcion')} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="precio">Precio (COP) *</Label>
                <Input
                  id="precio"
                  type="number"
                  step="0.01"
                  {...register('precio', { valueAsNumber: true })}
                />
                {errors.precio && <p className="text-sm text-destructive">{errors.precio.message}</p>}
              </div>

              <div className="flex items-center gap-2">
                <Switch {...register('disponible')} />
                <Label>Disponible</Label>
              </div>

              <Button type="submit" className="w-full" disabled={createMutation.isPending || updateMutation.isPending}>
                {createMutation.isPending || updateMutation.isPending ? 'Guardando...' : 'Guardar Plato'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Precio</TableHead>
            <TableHead>Disponible</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {dishes.map((dish: Dish) => (
            <TableRow key={dish.uuid}>
              <TableCell className="font-medium">{dish.nombre}</TableCell>
              <TableCell>${dish.precio.toLocaleString('es-CO')}</TableCell>
              <TableCell>{dish.disponible ? '✓' : '✗'}</TableCell>
              <TableCell className="text-right space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(dish)}
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteMutation.mutate(dish.uuid)}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {dishes.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No hay platos agregados. ¡Comienza por agregar tu primer plato!
        </div>
      )}
    </Card>
  );
};

export default MenuSection;
