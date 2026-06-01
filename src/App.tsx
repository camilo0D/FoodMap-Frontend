import PrivateRoute from "./components/PrivateRoute";
import SchemaOrg from "./components/SchemaOrg";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/AuthContext";
import Index from "./pages/Index.tsx";
import MapPage from "./pages/MapPage.tsx";
import DashboardPage from "./pages/DashboardPage.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <SchemaOrg
          schema={{
            '@type': 'WebSite',
            'name': 'FoodMap',
            'url': import.meta.env.VITE_APP_URL || window.location.origin,
            'potentialAction': {
              '@type': 'SearchAction',
              'target': {
                '@type': 'EntryPoint',
                'urlTemplate': `${import.meta.env.VITE_APP_URL || window.location.origin}/mapa?search={search_term_string}`,
              },
              'query-input': 'required name=search_term_string',
            },
          }}
        />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route
              path="/mapa"
              element={
                <PrivateRoute>
                  <MapPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute requiredRole="RESTAURANTE">
                  <DashboardPage />
                </PrivateRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
