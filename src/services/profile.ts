import { getToken } from "./auth";

const API_URL = "http://127.0.0.1:8000/api";

const getAuthHeaders = () => ({
  Authorization: `Bearer ${getToken()}`,
});

const getJsonHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

// ─── Interfaces ──────────────────────────────────────────────

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  nombre: string;
  bio: string;
  avatar: string | null;
  roles: string[];
  created_at: string;
}

export interface ReviewRestaurant {
  id: string;
  nombre: string;
  imagen: string | null;
}

export interface UserReview {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  restaurante: ReviewRestaurant;
}

// ─── Profile API ─────────────────────────────────────────────

/**
 * Obtiene el perfil del usuario autenticado.
 */
export const fetchUserProfile = async (): Promise<UserProfile> => {
  const res = await fetch(`${API_URL}/users/me/`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Error al obtener el perfil");
  return res.json();
};

/**
 * Actualiza el perfil del usuario autenticado.
 * Se usa FormData para soportar upload de avatar (multipart/form-data).
 * No se establece Content-Type manualmente — el browser lo pone con el boundary.
 */
export const updateUserProfile = async (data: FormData): Promise<UserProfile> => {
  const res = await fetch(`${API_URL}/users/me/`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: data,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.detail || "Error al actualizar el perfil");
  }
  return res.json();
};

// ─── Reviews API ─────────────────────────────────────────────

/**
 * Obtiene las reseñas publicadas por el usuario autenticado.
 */
export const fetchUserReviews = async (): Promise<UserReview[]> => {
  const res = await fetch(`${API_URL}/users/me/reviews/`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Error al obtener las reseñas");
  return res.json();
};

/**
 * Elimina (soft delete) una reseña del usuario.
 */
export const deleteUserReview = async (reviewId: string): Promise<{ message: string }> => {
  const res = await fetch(`${API_URL}/reviews/${reviewId}/`, {
    method: "DELETE",
    headers: getJsonHeaders(),
  });
  if (!res.ok) throw new Error("Error al eliminar la reseña");
  return res.json();
};
