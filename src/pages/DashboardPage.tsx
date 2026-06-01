import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { toast } from 'sonner';
import ProfileSection from './dashboard/ProfileSection';
import LocationSection from './dashboard/LocationSection';
import MenuSection from './dashboard/MenuSection';
import ReviewsSection from './dashboard/ReviewsSection';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [completeness, setCompleteness] = useState(0);

  const handleLogout = () => {
    logout();
    toast.success("Sesión cerrada");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-card shadow-nav border-b">
        <div className="container flex items-center justify-between py-4">
          <h1 className="text-2xl font-bold text-primary">Dashboard - Mi Restaurante</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="flex items-center gap-2 text-muted-foreground hover:text-destructive"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Cerrar sesión</span>
          </Button>
        </div>
      </header>

      <main className="container py-8">
        <div className="mb-8 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Perfil Completo</h2>
            <span className="text-sm font-medium text-muted-foreground">{completeness}%</span>
          </div>
          <Progress value={completeness} className="h-2" />
        </div>

        <Tabs defaultValue="perfil" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="perfil">Mi Perfil</TabsTrigger>
            <TabsTrigger value="ubicacion">Ubicación</TabsTrigger>
            <TabsTrigger value="menu">Mi Menú</TabsTrigger>
            <TabsTrigger value="resenas">Reseñas</TabsTrigger>
          </TabsList>

          <TabsContent value="perfil" className="mt-8">
            <ProfileSection onCompletenessChange={setCompleteness} />
          </TabsContent>

          <TabsContent value="ubicacion" className="mt-8">
            <LocationSection />
          </TabsContent>

          <TabsContent value="menu" className="mt-8">
            <MenuSection />
          </TabsContent>

          <TabsContent value="resenas" className="mt-8">
            <ReviewsSection />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default DashboardPage;
