const API_URL = "http://127.0.0.1:8000/api/auth";

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

export const getToken = () => localStorage.getItem("token");
export const getRoles = (): string[] => JSON.parse(localStorage.getItem("roles") || "[]");
export const getUsername = () => localStorage.getItem("username");
export const isAuthenticated = () => !!localStorage.getItem("token");