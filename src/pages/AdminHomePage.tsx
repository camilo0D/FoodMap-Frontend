import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Users, Utensils, MessageSquare, LogOut, Shield,
    ChevronRight, Activity, TrendingUp, AlertTriangle,
    BarChart3, Settings, UserCheck, Store, RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import { isAuthenticated, getRoles, getUsername, logoutUser } from "@/services/auth";
import { useQuery } from "@tanstack/react-query";
import { fetchAdminStats, fetchAdminUsers, fetchAdminRestaurants } from "@/services/admin";
import { SERVER_URL } from "@/config";

const API_BASE = SERVER_URL;

const AdminHomePage = () => {
    const navigate = useNavigate();
    const roles = getRoles();
    const username = getUsername();

    useEffect(() => {
        if (!isAuthenticated() || !roles.includes("admin")) {
            navigate("/");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useQuery({
        queryKey: ["admin-stats"],
        queryFn: fetchAdminStats,
    });

    const { data: users = [], isLoading: usersLoading } = useQuery({
        queryKey: ["admin-users"],
        queryFn: () => fetchAdminUsers({}),
    });

    const { data: restaurants = [], isLoading: restsLoading } = useQuery({
        queryKey: ["admin-restaurants"],
        queryFn: () => fetchAdminRestaurants({}),
    });

    const handleLogout = async () => {
        await logoutUser();
        window.location.href = "/";
    };

    const hour = new Date().getHours();
    const greeting = hour < 12 ? "Buenos días" : hour < 18 ? "Buenas tardes" : "Buenas noches";

    const recentUsers = (users as any[]).slice(0, 5);
    const recentRests = (restaurants as any[]).slice(0, 4);
    const inactiveRests = (restaurants as any[]).filter((r: any) => r.estado !== "activo");
    const suspendedUsers = (users as any[]).filter((u: any) => u.estado === "suspendido");

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
                <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Shield className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                            <span className="font-bold text-sm">FoodMap</span>
                            <span className="text-xs text-muted-foreground ml-2">Admin</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => refetchStats()}
                            title="Actualizar datos"
                        >
                            <RefreshCw className="w-4 h-4 text-muted-foreground" />
                        </Button>
                        <ThemeSwitcher />
                        <span className="text-xs text-muted-foreground hidden sm:block px-2">{username}</span>
                        <Button variant="ghost" size="icon" onClick={handleLogout} title="Cerrar sesión">
                            <LogOut className="w-4 h-4 text-muted-foreground" />
                        </Button>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">

                {/* Hero admin */}
                <section className="relative bg-gradient-to-br from-slate-800 to-slate-900 dark:from-slate-900 dark:to-black rounded-3xl p-7 text-white overflow-hidden">
                    <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, hsl(0 100% 65%) 0%, transparent 50%), radial-gradient(circle at 80% 20%, hsl(0 100% 65%) 0%, transparent 40%)" }} />
                    <div className="relative z-10 flex items-start justify-between gap-6">
                        <div>
                            <p className="text-slate-400 text-sm">{greeting}, {username}</p>
                            <h1 className="text-2xl font-bold mt-1 mb-1">Panel de Administración</h1>
                            <p className="text-slate-400 text-sm">Tienes control total sobre FoodMap. Todo bajo un mismo techo.</p>
                        </div>
                        <div className="hidden md:flex items-center gap-2 mt-1">
                            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                            <span className="text-xs text-slate-400">Sistema activo</span>
                        </div>
                    </div>
                    <div className="relative z-10 mt-5 flex gap-3">
                        <Button
                            size="sm"
                            onClick={() => navigate("/admin")}
                            className="bg-primary hover:bg-primary/90 text-white text-xs font-semibold flex items-center gap-1.5"
                        >
                            <Settings className="w-3.5 h-3.5" />
                            Panel completo
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate("/admin?tab=users")}
                            className="border-slate-600 text-slate-300 hover:bg-slate-700 text-xs"
                        >
                            Gestionar usuarios
                        </Button>
                    </div>
                </section>

                {/* Alertas */}
                {(inactiveRests.length > 0 || suspendedUsers.length > 0) && (
                    <section className="space-y-2">
                        {suspendedUsers.length > 0 && (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4 flex items-center gap-3">
                                <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
                                <p className="text-sm text-red-700 dark:text-red-300 flex-1">
                                    <span className="font-bold">{suspendedUsers.length} usuarios</span> suspendidos necesitan revisión
                                </p>
                                <Button size="sm" variant="outline" onClick={() => navigate("/admin?tab=users")} className="text-xs border-red-300 text-red-600 hover:bg-red-50">
                                    Revisar
                                </Button>
                            </div>
                        )}
                        {inactiveRests.length > 0 && (
                            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 flex items-center gap-3">
                                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                                <p className="text-sm text-amber-700 dark:text-amber-300 flex-1">
                                    <span className="font-bold">{inactiveRests.length} restaurantes</span> inactivos o suspendidos
                                </p>
                                <Button size="sm" variant="outline" onClick={() => navigate("/admin?tab=restaurants")} className="text-xs border-amber-300 text-amber-600 hover:bg-amber-50">
                                    Revisar
                                </Button>
                            </div>
                        )}
                    </section>
                )}

                {/* Stats globales */}
                <section>
                    <h2 className="text-base font-bold mb-3 flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-primary" />
                        Resumen del sistema
                    </h2>
                    {statsLoading ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[1, 2, 3, 4].map((i) => <div key={i} className="h-28 bg-card border border-border rounded-2xl animate-pulse" />)}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { label: "Usuarios totales", value: stats?.total_users ?? 0, icon: Users, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20", action: () => navigate("/admin?tab=users") },
                                { label: "Restaurantes", value: stats?.total_restaurants ?? 0, icon: Utensils, color: "text-primary", bg: "bg-primary/10", action: () => navigate("/admin?tab=restaurants") },
                                { label: "Reseñas", value: stats?.total_reviews ?? 0, icon: MessageSquare, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-900/20", action: null },
                                { label: "Usuarios activos", value: (users as any[]).filter((u: any) => u.is_active).length, icon: Activity, color: "text-green-500", bg: "bg-green-50 dark:bg-green-900/20", action: null },
                            ].map(({ label, value, icon: Icon, color, bg, action }) => (
                                <button
                                    key={label}
                                    onClick={action || undefined}
                                    className={`bg-card border border-border rounded-2xl p-5 text-left transition-all ${action ? "hover:border-primary/30 hover:shadow-sm cursor-pointer" : "cursor-default"}`}
                                >
                                    <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mb-3`}>
                                        <Icon className={`w-4 h-4 ${color}`} />
                                    </div>
                                    <p className="text-2xl font-bold">{value.toLocaleString("es-CO")}</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
                                    {action && <p className="text-xs text-primary mt-2">Ver detalles →</p>}
                                </button>
                            ))}
                        </div>
                    )}
                </section>

                {/* Accesos rápidos */}
                <section>
                    <h2 className="text-base font-bold mb-3">Acciones de administración</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {[
                            { label: "Gestionar usuarios", desc: "Ver, activar y asignar roles", icon: UserCheck, action: () => navigate("/admin?tab=users") },
                            { label: "Gestionar restaurantes", desc: "Estado, categoría y dueños", icon: Store, action: () => navigate("/admin?tab=restaurants") },
                            { label: "Ver mapa", desc: "Vista pública de restaurantes", icon: TrendingUp, action: () => navigate("/mapa") },
                            { label: "Panel completo", desc: "Todas las herramientas admin", icon: Settings, action: () => navigate("/admin") },
                        ].map(({ label, desc, icon: Icon, action }) => (
                            <button
                                key={label}
                                onClick={action}
                                className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3 hover:border-primary/40 hover:shadow-sm transition-all text-left"
                            >
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                                    <Icon className="w-5 h-5 text-primary" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-sm">{label}</p>
                                    <p className="text-xs text-muted-foreground">{desc}</p>
                                </div>
                                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                            </button>
                        ))}
                    </div>
                </section>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Últimos usuarios */}
                    <section className="bg-card border border-border rounded-2xl overflow-hidden">
                        <div className="p-4 border-b border-border flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-primary" />
                                <h2 className="font-bold text-sm">Usuarios recientes</h2>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => navigate("/admin?tab=users")} className="text-xs text-primary">
                                Ver todos <ChevronRight className="w-3 h-3" />
                            </Button>
                        </div>
                        {usersLoading ? (
                            <div className="p-4 space-y-3">
                                {[1, 2, 3].map((i) => <div key={i} className="h-10 bg-muted rounded-xl animate-pulse" />)}
                            </div>
                        ) : recentUsers.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground text-sm">No hay usuarios</div>
                        ) : (
                            <div className="divide-y divide-border">
                                {recentUsers.map((u: any) => (
                                    <div key={u.id} className="px-4 py-3 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                                            {(u.nombre || u.username || "U").slice(0, 2).toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{u.username}</p>
                                            <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${u.estado === "activo" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                                    : u.estado === "suspendido" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                                        : "bg-muted text-muted-foreground"
                                                }`}>
                                                {u.estado}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Últimos restaurantes */}
                    <section className="bg-card border border-border rounded-2xl overflow-hidden">
                        <div className="p-4 border-b border-border flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Utensils className="w-4 h-4 text-primary" />
                                <h2 className="font-bold text-sm">Restaurantes registrados</h2>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => navigate("/admin?tab=restaurants")} className="text-xs text-primary">
                                Ver todos <ChevronRight className="w-3 h-3" />
                            </Button>
                        </div>
                        {restsLoading ? (
                            <div className="p-4 space-y-3">
                                {[1, 2, 3].map((i) => <div key={i} className="h-10 bg-muted rounded-xl animate-pulse" />)}
                            </div>
                        ) : recentRests.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground text-sm">No hay restaurantes</div>
                        ) : (
                            <div className="divide-y divide-border">
                                {recentRests.map((r: any) => (
                                    <div key={r.id} className="px-4 py-3 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg overflow-hidden bg-muted flex items-center justify-center flex-shrink-0">
                                            {r.imagen ? (
                                                <img src={r.imagen.startsWith("http") ? r.imagen : `${API_BASE}${r.imagen}`} className="w-full h-full object-cover" alt={r.nombre} />
                                            ) : (
                                                <Utensils className="w-4 h-4 text-muted-foreground" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{r.nombre}</p>
                                            <p className="text-xs text-muted-foreground truncate">{r.categoria?.nombre || r.categoria || "Sin categoría"}</p>
                                        </div>
                                        <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${r.estado === "activo" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                                : r.estado === "suspendido" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                                    : "bg-muted text-muted-foreground"
                                            }`}>
                                            {r.estado}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </div>

            </main>
        </div>
    );
};

export default AdminHomePage;