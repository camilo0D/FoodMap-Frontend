import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "./context/AuthContext.tsx";

import MainLayout from "./layouts/MainLayout.tsx";
import { ProtectedRoute } from "./components/ProtectedRoute.tsx";

import Index from "./pages/Index.tsx";
import MapPage from "./pages/MapPage.tsx";
import NotFound from "./pages/NotFound.tsx";
import LoginPage from "./pages/auth/LoginPage.tsx";
import RegisterPage from "./pages/auth/RegisterPage.tsx";
import RegisterRestaurantPage from "./pages/auth/RegisterRestaurantPage.tsx";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Evita peticiones innecesarias al cambiar de pestaña
      retry: 1, // Si falla una petición, reintenta 1 vez
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner position="top-right" richColors />
        <BrowserRouter>
          <Routes>
            {/* Rutas Públicas (Sin MainLayout para no afectar su propio diseño) */}
            <Route path="/" element={<Index />} />
            <Route path="/mapa" element={<MapPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/register-restaurant" element={<RegisterRestaurantPage />} />
            <Route path="/registro-restaurante" element={<RegisterRestaurantPage />} />

            <Route element={<MainLayout />}>
              {/* Rutas Protegidas - Solo Usuarios Logueados */}
              <Route element={<ProtectedRoute />}>
                <Route path="/perfil" element={<div>Mi Perfil (Próximamente)</div>} />
              </Route>

              {/* Rutas Protegidas - Solo Restaurantes */}
              <Route element={<ProtectedRoute allowedRoles={['RESTAURANTE']} />}>
                <Route path="/dashboard" element={<div>Dashboard de Restaurante</div>} />
              </Route>

              {/* Rutas Protegidas - Solo Administradores */}
              <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
                <Route path="/admin" element={<div>Panel de Administración</div>} />
              </Route>
            </Route>

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
