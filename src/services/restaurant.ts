import { getToken } from "./auth";

import { API_BASE_URL } from "@/config";
const API_URL = API_BASE_URL;

const getAuthHeaders = () => ({
    Authorization: `Bearer ${getToken()}`,
});

const getJsonHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
});

export interface Plato {
    id: string;
    nombre: string;
    descripcion: string;
    precio: number;
    imagen: string | null;
    disponible: boolean;
}

export interface Restaurante {
    id: string;
    nombre: string;
    descripcion: string;
    telefono: string;
    imagen: string;
    direccion: string;
    latitud: number;
    longitud: number;
    horario: Record<string, string>;
    calificacion_promedio: number;
    total_calificaciones: number;
    categoria: { id: string; nombre: string; icono: string } | null;
}

// Obtener el restaurante del dueño autenticado
export const fetchMyRestaurant = async (): Promise<Restaurante | null> => {
    const res = await fetch(`${API_URL}/restaurantes/mio/`, {
        headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Error al obtener restaurante");
    const data = await res.json();
    return data && data.id ? data : null;
};

// Subir imagen y obtener URL
export const uploadRestaurantImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("imagen", file);
    const res = await fetch(`${API_URL}/restaurantes/upload/image/`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: formData,
    });
    if (!res.ok) throw new Error("Error al subir la imagen");
    const data = await res.json();
    return data.url;
};

// Actualizar restaurante
export const updateRestaurant = async (id: string, data: FormData): Promise<Restaurante> => {
    const res = await fetch(`${API_URL}/restaurantes/${id}/`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: data,
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(JSON.stringify(err));
    }
    return res.json();
};

// Obtener platos del restaurante
export const fetchPlatos = async (restauranteId: string): Promise<Plato[]> => {
    const res = await fetch(`${API_URL}/restaurantes/${restauranteId}/menu/`, {
        headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Error al obtener platos");
    return res.json();
};

// Crear plato
export const createPlato = async (restauranteId: string, data: FormData): Promise<Plato> => {
    const res = await fetch(`${API_URL}/restaurantes/${restauranteId}/menu/`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: data,
    });
    if (!res.ok) throw new Error("Error al crear plato");
    return res.json();
};

// Actualizar plato
export const updatePlato = async (restauranteId: string, platoId: string, data: FormData): Promise<Plato> => {
    const res = await fetch(`${API_URL}/restaurantes/${restauranteId}/menu/${platoId}/`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: data,
    });
    if (!res.ok) throw new Error("Error al actualizar plato");
    return res.json();
};

// Eliminar plato
export const deletePlato = async (restauranteId: string, platoId: string): Promise<void> => {
    const res = await fetch(`${API_URL}/restaurantes/${restauranteId}/menu/${platoId}/`, {
        method: "DELETE",
        headers: getJsonHeaders(),
    });
    if (!res.ok) throw new Error("Error al eliminar plato");
};

// Obtener reseñas del restaurante
export const fetchResenasRestaurante = async (restauranteId: string) => {
    const res = await fetch(`${API_URL}/restaurantes/${restauranteId}/reviews/`, {
        headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Error al obtener reseñas");
    return res.json();
};