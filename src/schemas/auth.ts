import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Ingresa un correo válido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export const registerUserSchema = z.object({
  nombre: z.string().min(2, "El nombre es muy corto"),
  email: z.string().email("Ingresa un correo válido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

export const registerRestaurantSchema = z.object({
  nombreLocal: z.string().min(2, "El nombre del local es obligatorio"),
  email: z.string().email("Ingresa un correo válido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  direccion: z.string().min(5, "Ingresa una dirección válida"),
  categoria: z.string().min(1, "Selecciona una categoría"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterUserFormValues = z.infer<typeof registerUserSchema>;
export type RegisterRestaurantFormValues = z.infer<typeof registerRestaurantSchema>;
