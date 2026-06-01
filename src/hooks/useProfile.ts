import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchUserProfile,
  updateUserProfile,
  fetchUserReviews,
  deleteUserReview,
} from "@/services/profile";
import { toast } from "sonner";

/**
 * Hook para obtener el perfil del usuario autenticado.
 */
export const useUserProfile = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ["user-profile"],
    queryFn: fetchUserProfile,
    staleTime: 1000 * 60 * 5, // 5 minutos
    retry: 1,
    ...options,
  });
};

/**
 * Hook para actualizar el perfil del usuario.
 * Invalida el caché de perfil tras éxito.
 */
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUserProfile,
    onSuccess: (updatedProfile) => {
      // Actualiza el caché inmediatamente con los nuevos datos
      queryClient.setQueryData(["user-profile"], updatedProfile);
      
      // Invalida el caché para que se refresquen los datos en todas las vistas
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });

      // Actualiza el username en localStorage si cambió
      if (updatedProfile.username) {
        localStorage.setItem("username", updatedProfile.username);
      }

      toast.success("¡Perfil actualizado correctamente!");
    },
    onError: (error: Error) => {
      console.error("Error al actualizar perfil:", error);
      toast.error(error.message || "Error al actualizar el perfil. Intenta de nuevo.");
    },
  });
};

/**
 * Hook para obtener las reseñas del usuario autenticado.
 */
export const useUserReviews = () => {
  return useQuery({
    queryKey: ["user-reviews"],
    queryFn: fetchUserReviews,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
};

/**
 * Hook para eliminar (soft delete) una reseña del usuario.
 * Invalida el caché de reseñas tras éxito.
 */
export const useDeleteReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteUserReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-reviews"] });
      toast.success("Reseña eliminada correctamente");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al eliminar la reseña");
    },
  });
};
