import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
// Asumiendo que usarás iconos de lucide-react
import { MapPin, LogOut, LayoutDashboard, Settings } from 'lucide-react'; 

export default function MainLayout() {
  const { user, logout } = useAuth();
  const isAdmin = user?.rol === 'ADMIN';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Header General */}
      <header className="h-16 border-b bg-white flex items-center justify-between px-6 sticky top-0 z-50">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl text-orange-600">
          <MapPin /> FoodMap
        </Link>
        <nav className="flex gap-4 items-center">
          {user ? (
            <button onClick={logout} className="flex items-center gap-2 text-sm hover:text-red-600">
              <LogOut size={16} /> Salir
            </button>
          ) : (
            <Link to="/login" className="text-sm font-medium hover:underline">Iniciar Sesión</Link>
          )}
        </nav>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar (Solo visible para ADMIN) */}
        {isAdmin && (
          <aside className="w-64 bg-slate-900 text-white flex flex-col">
            <div className="p-4 font-semibold text-slate-400 uppercase text-xs">Admin Panel</div>
            <nav className="flex-1 px-2 space-y-1">
              <Link to="/admin" className="flex items-center gap-3 px-3 py-2 rounded hover:bg-slate-800">
                <LayoutDashboard size={18} /> Dashboard
              </Link>
              <Link to="/admin/settings" className="flex items-center gap-3 px-3 py-2 rounded hover:bg-slate-800">
                <Settings size={18} /> Configuración
              </Link>
            </nav>
          </aside>
        )}

        {/* Main Content (Aquí se renderizan las páginas) */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
