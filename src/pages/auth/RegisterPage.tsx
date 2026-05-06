import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { registerUserSchema, RegisterUserFormValues } from "@/schemas/auth";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function RegisterPage() {
  const navigate = useNavigate();
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterUserFormValues>({
    resolver: zodResolver(registerUserSchema)
  });

  const onSubmit = async (data: RegisterUserFormValues) => {
    try {
      await api.post('/auth/register/user/', data);
      toast.success("¡Usuario registrado! Ahora puedes iniciar sesión.");
      navigate('/login');
    } catch (error) {
      toast.error("Hubo un error al registrar el usuario. Intenta de nuevo.");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded-lg shadow-sm">
      <h2 className="text-2xl font-bold mb-6 text-center">Registrar Usuario</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        
        <div>
          <label className="block text-sm font-medium mb-1">Nombre</label>
          <Input {...register("nombre")} placeholder="Juan Perez" />
          {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <Input type="email" {...register("email")} placeholder="correo@ejemplo.com" />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Contraseña</label>
          <Input type="password" {...register("password")} placeholder="••••••••" />
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Confirmar Contraseña</label>
          <Input type="password" {...register("confirmPassword")} placeholder="••••••••" />
          {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Registrando..." : "Crear cuenta"}
        </Button>
      </form>
    </div>
  );
}
