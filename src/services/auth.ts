import { API_BASE_URL } from "@/config";
const API_URL = `${API_BASE_URL}/auth`;

export const loginUser = async (username: string, password: string) => {
  const res = await fetch(`${API_URL}/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) throw new Error("Error en login");

  const data = await res.json();

  // Guarda access, refresh y roles en localStorage
  localStorage.setItem("token", data.access);
  localStorage.setItem("refresh", data.refresh);
  localStorage.setItem("roles", JSON.stringify(data.user.roles));
  localStorage.setItem("username", data.user.username);

  return data;
};

export const registerUser = async (username: string, email: string, password: string) => {
  const res = await fetch(`${API_URL}/register/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw error;
  }

  return res.json();
};

export const registerRestaurant = async (username: string, email: string, password: string) => {
  const res = await fetch(`${API_URL}/register/restaurant/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw error;
  }

  return res.json();
};

export const logoutUser = async () => {
  const refresh = localStorage.getItem("refresh");

  if (refresh) {
    await fetch(`${API_URL}/logout/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ refresh }),
    });
  }

  // Limpia todo el localStorage
  localStorage.removeItem("token");
  localStorage.removeItem("refresh");
  localStorage.removeItem("roles");
  localStorage.removeItem("username");
};


// Refresca el access token usando el refresh token guardado
export const refreshAccessToken = async (): Promise<boolean> => {
  const refresh = localStorage.getItem("refresh");
  if (!refresh) return false;
  try {
    const res = await fetch(`${API_URL}/token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    });
    if (!res.ok) {
      // Refresh expiró — limpiar sesión
      localStorage.removeItem("token");
      localStorage.removeItem("refresh");
      localStorage.removeItem("roles");
      localStorage.removeItem("username");
      return false;
    }
    const data = await res.json();
    localStorage.setItem("token", data.access);
    return true;
  } catch {
    return false;
  }
};

// Fetch autenticado con refresh automático si el token expiró
export const authFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const token = localStorage.getItem("token");
  const headers = {
    ...(options.headers || {}),
    Authorization: `Bearer ${token}`,
  };
  let res = await fetch(url, { ...options, headers });
  if (res.status === 401) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      headers.Authorization = `Bearer ${localStorage.getItem("token")}`;
      res = await fetch(url, { ...options, headers });
    }
  }
  return res;
};

export const getToken = () => localStorage.getItem("token");
export const getRoles = (): string[] => JSON.parse(localStorage.getItem("roles") || "[]");
export const getUsername = () => localStorage.getItem("username");
export const isAuthenticated = () => !!localStorage.getItem("token");