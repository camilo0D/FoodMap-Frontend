import PrivateRoute from "./components/PrivateRoute";
import AdminRoute from "./components/AdminRoute";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import MapPage from "./pages/MapPage.tsx";
import AdminPage from "./pages/AdminPage.tsx";
import ProfilePage from "./pages/ProfilePage.tsx";
import NotFound from "./pages/NotFound.tsx";
import RestaurantDetailPage from "./pages/RestaurantDetailPage.tsx";
import DashboardPage from "./pages/DashboardPage.tsx";
import UserHomePage from "./pages/UserHomePage.tsx";
import RestaurantHomePage from "./pages/RestaurantHomePage.tsx";
import AdminHomePage from "./pages/AdminHomePage.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />

          {/* Homes por rol — destino post-login */}
          <Route
            path="/home/usuario"
            element={
              <PrivateRoute>
                <UserHomePage />
              </PrivateRoute>
            }
          />
          <Route
            path="/home/restaurante"
            element={
              <PrivateRoute>
                <RestaurantHomePage />
              </PrivateRoute>
            }
          />
          <Route
            path="/home/admin"
            element={
              <AdminRoute>
                <AdminHomePage />
              </AdminRoute>
            }
          />

          {/* Rutas existentes */}
          <Route
            path="/mapa"
            element={
              <PrivateRoute>
                <MapPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminPage />
              </AdminRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <DashboardPage />
              </PrivateRoute>
            }
          />
          <Route path="/restaurante/:id" element={<RestaurantDetailPage />} />
          <Route
            path="/perfil"
            element={
              <PrivateRoute>
                <ProfilePage />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;