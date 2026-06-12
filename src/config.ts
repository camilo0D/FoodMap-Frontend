/**
 * URL base del backend.
 * En desarrollo apunta a http://127.0.0.1:8000
 * En producción usa la variable VITE_API_URL del .env
 */
export const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000/api";

/**
 * Raíz del servidor (sin /api) — para construir URLs de imágenes/media.
 * Ej: http://foodmap.ds2.eleueleo.com  o  http://127.0.0.1:8000
 */
export const SERVER_URL = API_BASE_URL.replace(/\/api\/?$/, "");