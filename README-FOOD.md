# FoodMap Frontend Documentación (FOOD-004 & FOOD-005)

Este documento resume los cambios y componentes implementados en el Frontend de FoodMap a través de las historias de desarrollo.

## FOOD-005: Configuración base del proyecto y estructura de carpetas

### 1. Definición de Tipos TypeScript (`src/types/index.ts`)
Se establecieron interfaces fuertemente tipadas basadas en el modelo de datos de Django:
- **Roles y Estados**: `Rol`, `Estado`
- **Modelos de la BD**: `User`, `Perfil`, `Categoria`, `Restaurant`

### 2. Variables de Entorno (`.env.example`)
Se agregó un archivo plantilla con las variables necesarias para inicializar el proyecto:
- `VITE_API_URL` (para uso general de la API, consumido por la instancia Axios).
- `VITE_GOOGLE_MAPS_API_KEY` (preparado para el próximo sprint).

### 3. Layout Principal (`src/layouts/MainLayout.tsx`)
Se diseñó un layout principal (`MainLayout`) que engloba toda la aplicación:
- **Header**: Barra de navegación superior con logotipo, enlaces y botón de salida (si el usuario está autenticado).
- **Sidebar**: Menú lateral dinámico visible exclusivamente para usuarios con rol `ADMIN`.
- **Main Content**: Un espacio principal donde se renderizan las rutas anidadas dinámicamente usando `<Outlet />`.

### 4. Configuración Global (`src/App.tsx`)
Se reorganizó el archivo de entrada para conectar herramientas de estado asíncrono y enrutamiento avanzado:
- **React Query (`@tanstack/react-query`)**: Se implementó un `QueryClient` global con opciones por defecto para caché y refetching.
- **Enrutamiento (React Router DOM v6)**: Se configuraron rutas bajo la estructura del `MainLayout`.
- Se definieron **rutas protegidas** basadas en roles (por ejemplo, para el dashboard de restaurantes o el panel de administración) combinando `ProtectedRoute` y el sistema de ruteo de `react-router-dom`.

---

## FOOD-004: Pantallas de Login y Registro

### Tecnologías Utilizadas
- **React Hook Form**: Para el manejo eficiente de los estados del formulario.
- **Zod**: Para la validación de esquemas tipados y mensajes de error.
- **Axios**: Cliente HTTP configurado con interceptores.
- **jwt-decode**: Para la extracción de claims (como el rol de usuario) desde el token JWT.
- **Sonner**: Para las notificaciones tipo toast (mensajes de éxito o error).

### Estructura de Archivos Creados y Modificados

#### 1. Validaciones (`src/schemas/auth.ts`)
Se centralizaron todas las validaciones de los formularios usando **Zod**.
- `loginSchema`: Valida que el email tenga el formato correcto y la contraseña el largo mínimo.
- `registerUserSchema`: Valida nombre, email y contraseña, asegurando con `.refine` que las contraseñas coincidan.
- `registerRestaurantSchema`: Además de los campos base, exige el nombre del local, dirección y categoría.

#### 2. Cliente de API e Interceptores (`src/lib/api.ts`)
Se configuró una instancia base de **Axios**:
- **Interceptor de Petición**: Adjunta automáticamente el `access_token` en el header `Authorization: Bearer <token>` de cada petición si el usuario está logueado.
- **Interceptor de Respuesta**: Detecta si el servidor responde con error `401 (Unauthorized)`. Si es así, intenta renovar el token usando el `refresh_token`. Si la renovación falla (por expiración del refresh, por ejemplo), se cierra la sesión del usuario.

#### 3. Contexto de Autenticación (`src/context/AuthContext.tsx`)
Maneja el estado global del usuario logueado en la aplicación.
- Verifica si existe un token en el `localStorage` al inicializar la app.
- Utiliza `jwt-decode` para interpretar el contenido del token (rol, email, tiempo de expiración) y lo guarda en estado.
- Provee las funciones `login` (que guarda los tokens y el estado) y `logout` (que limpia almacenamiento y estado).
- Exporta el custom hook `useAuth` para acceder fácilmente a estos datos desde cualquier componente.

#### 4. Rutas Protegidas (`src/components/ProtectedRoute.tsx`)
Un componente de envoltura (`Wrapper`) para React Router:
- Verifica si un usuario está autenticado; si no, redirige al `/login`.
- Si se le pasan roles específicos (`allowedRoles`), valida si el rol contenido en el token del usuario tiene los permisos suficientes para acceder a la ruta.

#### 5. Páginas de Formularios (`src/pages/auth/`)
Vistas de interfaz completas utilizando el ecosistema de validación y contexto mencionado.
- `LoginPage.tsx`: Vista para iniciar sesión. Maneja errores con Toasts de Sonner.
- `RegisterPage.tsx`: Vista para el registro de usuarios normales.
- `RegisterRestaurantPage.tsx`: Vista de registro enfocada a los locales comerciales o restaurantes.

---
## Siguientes Pasos
Con esta arquitectura lista, los próximos pasos recomendados son:
- Integrar el componente `ProtectedRoute` en aquellas vistas que requieran autenticación en las siguientes fases del desarrollo.
- Asegurarse de que la variable de entorno `VITE_API_URL` esté correctamente apuntando a tu backend de Django en tus ambientes locales o de despliegue.
