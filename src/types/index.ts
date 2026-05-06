export type Rol = 'USUARIO' | 'RESTAURANTE' | 'ADMIN';
export type Estado = 'activo' | 'inactivo' | 'suspendido' | 'pendiente';

export interface Perfil {
  nombre: string;
  avatar?: string;
  bio?: string;
}

export interface User {
  uuid: string; // Heredado de AbstractBaseModel
  email: string;
  rol: Rol;
  perfil: Perfil;
  estado: Estado;
  created_at: string;
  updated_at: string;
}

export interface Categoria {
  uuid: string;
  nombre: string;
  icono: string;
  slug: string;
}

export interface Restaurant {
  uuid: string;
  nombre: string;
  descripcion: string;
  direccion: string;
  latitud: number;
  longitud: number;
  telefono?: string;
  horario?: string;
  imagen?: string;
  categoria: Categoria | string; // Dependiendo si el backend devuelve el objeto o el ID
  usuario_owner: string;
  estado: Estado;
}
