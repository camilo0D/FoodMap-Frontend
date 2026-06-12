import { getToken } from "./auth";

import { API_BASE_URL } from "@/config";
const API_URL = `${API_BASE_URL}/admin`;

const getHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

export interface AdminStats {
  total_users: number;
  total_restaurants: number;
  total_reviews: number;
  total_categories: number;
  categories: string[];
}

export const fetchAdminStats = async (): Promise<AdminStats> => {
  const res = await fetch(`${API_URL}/dashboard/`, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error("Error fetching admin stats");
  const data = await res.json();
  // Adaptar la respuesta del backend
  return {
    total_users: data.usuarios?.total || 0,
    total_restaurants: data.restaurantes?.total || 0,
    total_reviews: data.resenas?.total || 0,
    total_categories: 0,
    categories: [],
  };
};

export interface UserFilters {
  search?: string;
  estado?: string;
  rol?: string;
}

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  roles: string[];
  estado: string;
  created_at: string | null;
  is_active: boolean;
  nombre?: string;
  bio?: string;
  avatar?: string | null;
}

export const fetchAdminUsers = async (filters: UserFilters = {}): Promise<AdminUser[]> => {
  const params = new URLSearchParams();
  if (filters.search) params.append("search", filters.search);
  if (filters.estado) params.append("estado", filters.estado);
  if (filters.rol) params.append("rol", filters.rol);

  const res = await fetch(`${API_URL}/users/?${params.toString()}`, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error("Error fetching admin users");
  return res.json();
};

/**
 * Obtiene los datos actualizados de un usuario específico por ID.
 * Útil para refrescar los datos del usuario en el modal de detalles.
 */
export const fetchAdminUserById = async (userId: string): Promise<AdminUser> => {
  const res = await fetch(`${API_URL}/users/${userId}/`, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error("Error fetching user details");
  return res.json();
};

export const updateUserStatusAndRole = async (
  userId: string,
  data: { estado?: string; roles?: string[] }
): Promise<AdminUser> => {
  const res = await fetch(`${API_URL}/users/${userId}/`, {
    method: "PATCH",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error updating user");
  return res.json();
};

export const deleteUser = async (userId: string): Promise<{ message: string }> => {
  const res = await fetch(`${API_URL}/users/${userId}/`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error("Error deleting user");
  return res.json();
};

export interface RestaurantFilters {
  search?: string;
  estado?: string;
  categoria?: string;
}

export interface AdminRestaurant {
  id: string;
  nombre: string;
  categoria: string;
  dueno: string;
  dueno_email: string;
  estado: string;
  calificacion_promedio: number;
  total_calificaciones: number;
  direccion: string;
  telefono: string;
  imagen: string;
}

export const fetchAdminRestaurants = async (
  filters: RestaurantFilters = {}
): Promise<AdminRestaurant[]> => {
  const params = new URLSearchParams();
  if (filters.search) params.append("search", filters.search);
  if (filters.estado) params.append("estado", filters.estado);
  if (filters.categoria) params.append("categoria", filters.categoria);

  const res = await fetch(`${API_URL}/restaurantes/?${params.toString()}`, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error("Error fetching admin restaurants");
  return res.json();
};

export const updateRestaurantStatusAndCategory = async (
  restId: string,
  data: { estado?: string; categoria?: string }
): Promise<AdminRestaurant> => {
  const res = await fetch(`${API_URL}/restaurantes/${restId}/`, {
    method: "PATCH",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error updating restaurant");
  return res.json();
};

export const deleteRestaurant = async (restId: string): Promise<{ message: string }> => {
  const res = await fetch(`${API_URL}/restaurantes/${restId}/`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error("Error deleting restaurant");
  return res.json();
};

export const assignRestaurantOwner = async (
  restId: string,
  duenoId: string
): Promise<{ message: string; dueno: string; dueno_id: string }> => {
  const res = await fetch(`${API_URL}/restaurantes/${restId}/asignar-dueno/`, {
    method: "PATCH",
    headers: getHeaders(),
    body: JSON.stringify({ dueno_id: duenoId }),
  });
  if (!res.ok) throw new Error("Error asignando dueño");
  return res.json();
};