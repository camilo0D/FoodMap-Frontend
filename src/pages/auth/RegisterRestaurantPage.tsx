import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { registerRestaurantSchema, RegisterRestaurantFormValues } from "@/schemas/auth";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function RegisterRestaurantPage() {
  const navigate = useNavigate();
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterRestaurantFormValues>({
    resolver: zodResolver(registerRestaurantSchema)
  });

  const onSubmit = async (data: RegisterRestaurantFormValues) => {
    try {
      await api.post('/auth/register/restaurant/', data);
      toast.success("¡Restaurante registrado! Ahora puedes iniciar sesión.");
      navigate('/login');
    } catch (error) {
      toast.error("Hubo un error al registrar el restaurante. Intenta de nuevo.");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded-lg shadow-sm">
      <h2 className="text-2xl font-bold mb-6 text-center">Registra tu Restaurante</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        
        <div>
          <label className="block text-sm font-medium mb-1">Nombre del Local</label>
          <Input {...register("nombreLocal")} placeholder="Ej. El Buen Sabor" />
          {errors.nombreLocal && <p className="text-red-500 text-xs mt-1">{errors.nombreLocal.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Dirección</label>
          <Input {...register("direccion")} placeholder="Av. Principal 123" />
          {errors.direccion && <p className="text-red-500 text-xs mt-1">{errors.direccion.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Categoría</label>
          <Input {...register("categoria")} placeholder="Ej. Comida Rápida" />
          {errors.categoria && <p className="text-red-500 text-xs mt-1">{errors.categoria.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <Input type="email" {...register("email")} placeholder="contacto@local.com" />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Contraseña</label>
          <Input type="password" {...register("password")} placeholder="••••••••" />
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Registrando..." : "Crear cuenta comercial"}
        </Button>
      </form>
    </div>
  );
}
