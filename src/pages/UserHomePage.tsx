import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Star, UtensilsCrossed, LogOut, User, Search, ChevronRight, Clock, TrendingUp, Heart, Map } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import { isAuthenticated, getUsername, getRoles, logoutUser } from "@/services/auth";
import { useUserProfile, useUserReviews } from "@/hooks/useProfile";
import { API_BASE_URL as API_BASE, SERVER_URL } from "@/config";
import { toast } from "sonner";

const UserHomePage = () => {
    const navigate = useNavigate();
    const username = getUsername();
    const roles = getRoles();

    const { data: profile } = useUserProfile();
    const { data: reviews = [] } = useUserReviews();

    const [restaurants, setRestaurants] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [greeting, setGreeting] = useState("");

    useEffect(() => {
        if (!isAuthenticated() || roles.includes("restaurante") || roles.includes("admin")) {
            navigate("/");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting("Buenos días");
        else if (hour < 18) setGreeting("Buenas tardes");
        else setGreeting("Buenas noches");
    }, []);

    useEffect(() => {
        fetch(`${API_BASE}/restaurantes/`)
            .then((r) => r.json())
            .then((d) => setRestaurants(Array.isArray(d) ? d : (d.results ?? [])))
            .catch(() => setRestaurants([]))
            .finally(() => setLoading(false));
    }, []);

    const resolvedAvatar = profile?.avatar
        ? (profile.avatar.startsWith("http") ? profile.avatar : `${SERVER_URL}${profile.avatar}`)
        : null;

    const initials = (profile?.nombre || profile?.username || username || "U")
        .split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2);

    const displayName = profile?.nombre || username || "Explorador";

    const filtered = restaurants.filter((r) =>
        r.nombre?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.categoria?.nombre?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const topRated = [...restaurants].sort((a, b) => (b.calificacion_promedio || 0) - (a.calificacion_promedio || 0)).slice(0, 4);
    const recent = restaurants.slice(0, 4);

    const handleLogout = async () => {
        await logoutUser();
        window.location.href = "/";
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
                <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="text-xl font-bold text-primary tracking-tight">FoodMap</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <ThemeSwitcher />
                        <Button variant="ghost" size="sm" onClick={() => navigate("/perfil")} className="flex items-center gap-2">
                            <Avatar className="w-7 h-7">
                                {resolvedAvatar && <AvatarImage src={resolvedAvatar} />}
                                <AvatarFallback className="text-xs bg-primary/10 text-primary font-bold">{initials}</AvatarFallback>
                            </Avatar>
                            <span className="hidden sm:block text-sm font-medium">{username}</span>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={handleLogout} title="Cerrar sesión">
                            <LogOut className="w-4 h-4 text-muted-foreground" />
                        </Button>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 py-8 space-y-10">

                {/* Hero de bienvenida */}
                <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-primary/90 to-orange-500 p-8 text-white">
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
                    <div className="relative z-10">
                        <p className="text-white/80 text-sm font-medium mb-1">{greeting},</p>
                        <h1 className="text-3xl font-bold mb-2">{displayName} 👋</h1>
                        <p className="text-white/80 text-sm mb-6">¿Qué quieres comer hoy? Hay {restaurants.length} restaurantes esperándote.</p>
                        <div className="flex gap-3">
                            <Button
                                onClick={() => navigate("/mapa")}
                                className="bg-white text-primary hover:bg-white/90 font-semibold flex items-center gap-2"
                            >
                                <Map className="w-4 h-4" />
                                Explorar mapa
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => navigate("/perfil")}
                                className="border-white/40 text-white bg-white/10 hover:bg-white/20"
                            >
                                Mi perfil
                            </Button>
                        </div>
                    </div>
                    {/* Decoración */}
                    <div className="absolute right-6 bottom-4 text-6xl opacity-20 select-none">🍕</div>
                </section>

                {/* Buscador */}
                <section>
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Buscar restaurantes o categorías..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                        />
                    </div>

                    {/* Resultados de búsqueda */}
                    {searchQuery && (
                        <div className="mt-3 bg-card border border-border rounded-xl overflow-hidden shadow-lg">
                            {filtered.length === 0 ? (
                                <div className="p-6 text-center text-muted-foreground text-sm">No se encontraron resultados</div>
                            ) : (
                                filtered.slice(0, 5).map((r) => (
                                    <button
                                        key={r.id}
                                        onClick={() => navigate(`/restaurante/${r.id}`)}
                                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors border-b border-border last:border-0 text-left"
                                    >
                                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                            {r.imagen ? (
                                                <img src={r.imagen.startsWith("http") ? r.imagen : `${SERVER_URL}${r.imagen}`} className="w-full h-full object-cover" alt={r.nombre} />
                                            ) : (
                                                <UtensilsCrossed className="w-5 h-5 text-primary" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-sm truncate">{r.nombre}</p>
                                            <p className="text-xs text-muted-foreground truncate">{r.categoria?.nombre} · {r.direccion}</p>
                                        </div>
                                        <div className="flex items-center gap-1 text-xs text-amber-500">
                                            <Star className="w-3 h-3 fill-current" />
                                            <span>{r.calificacion_promedio || "—"}</span>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    )}
                </section>

                {/* Stats rápidas del usuario */}
                <section className="grid grid-cols-3 gap-4">
                    {[
                        { label: "Reseñas escritas", value: (reviews as any[]).length, icon: Star, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-900/20" },
                        { label: "Restaurantes cerca", value: restaurants.length, icon: MapPin, color: "text-primary", bg: "bg-primary/10" },
                        { label: "Explorado hoy", value: "∞", icon: TrendingUp, color: "text-green-500", bg: "bg-green-50 dark:bg-green-900/20" },
                    ].map(({ label, value, icon: Icon, color, bg }) => (
                        <div key={label} className="bg-card rounded-2xl border border-border p-4 flex flex-col items-center text-center gap-2">
                            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}>
                                <Icon className={`w-5 h-5 ${color}`} />
                            </div>
                            <span className="text-2xl font-bold">{value}</span>
                            <span className="text-xs text-muted-foreground leading-tight">{label}</span>
                        </div>
                    ))}
                </section>

                {/* Mejor calificados */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-lg font-bold">Mejor calificados</h2>
                            <p className="text-xs text-muted-foreground">Los favoritos de la comunidad</p>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => navigate("/mapa")} className="text-primary text-xs flex items-center gap-1">
                            Ver todos <ChevronRight className="w-3 h-3" />
                        </Button>
                    </div>
                    {loading ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="bg-card rounded-2xl border border-border h-44 animate-pulse" />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {topRated.map((r) => (
                                <button
                                    key={r.id}
                                    onClick={() => navigate(`/restaurante/${r.id}`)}
                                    className="bg-card rounded-2xl border border-border overflow-hidden hover:shadow-md hover:border-primary/30 transition-all text-left group"
                                >
                                    <div className="h-24 bg-muted overflow-hidden relative">
                                        {r.imagen ? (
                                            <img src={r.imagen.startsWith("http") ? r.imagen : `${SERVER_URL}${r.imagen}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" alt={r.nombre} />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <UtensilsCrossed className="w-8 h-8 text-muted-foreground/40" />
                                            </div>
                                        )}
                                        <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                            {r.calificacion_promedio || "Nuevo"}
                                        </div>
                                    </div>
                                    <div className="p-3">
                                        <p className="font-semibold text-sm truncate">{r.nombre}</p>
                                        <p className="text-xs text-muted-foreground truncate">{r.categoria?.nombre}</p>
                                        <div className="flex items-center gap-1 mt-1.5 text-xs text-muted-foreground">
                                            <MapPin className="w-3 h-3" />
                                            <span className="truncate">{r.direccion?.split(",")[0]}</span>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </section>

                {/* Mis reseñas recientes */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-lg font-bold">Mis reseñas</h2>
                            <p className="text-xs text-muted-foreground">Tu historial de opiniones</p>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => navigate("/perfil")} className="text-primary text-xs flex items-center gap-1">
                            Ver perfil <ChevronRight className="w-3 h-3" />
                        </Button>
                    </div>

                    {(reviews as any[]).length === 0 ? (
                        <div className="bg-card border border-border border-dashed rounded-2xl p-10 text-center">
                            <Star className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
                            <p className="font-medium text-sm">Aún no has escrito reseñas</p>
                            <p className="text-xs text-muted-foreground mt-1 mb-4">Visita un restaurante y comparte tu experiencia</p>
                            <Button size="sm" onClick={() => navigate("/mapa")} className="text-xs">
                                Explorar restaurantes
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {(reviews as any[]).slice(0, 3).map((rev: any) => (
                                <div key={rev.id} className="bg-card border border-border rounded-2xl p-4 flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                                        <UtensilsCrossed className="w-5 h-5 text-primary" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <p className="font-semibold text-sm truncate">{rev.restaurante_nombre || "Restaurante"}</p>
                                            <div className="flex items-center gap-0.5">
                                                {Array.from({ length: 5 }).map((_, i) => (
                                                    <Star key={i} className={`w-3 h-3 ${i < rev.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`} />
                                                ))}
                                            </div>
                                        </div>
                                        {rev.comment && <p className="text-xs text-muted-foreground line-clamp-2">{rev.comment}</p>}
                                        <p className="text-xs text-muted-foreground/60 mt-1.5 flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {new Date(rev.created_at).toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* CTA bottom */}
                <section className="bg-card border border-border rounded-3xl p-6 flex items-center justify-between gap-4">
                    <div>
                        <h3 className="font-bold text-base">¿Listo para explorar?</h3>
                        <p className="text-sm text-muted-foreground">Abre el mapa y encuentra algo rico cerca tuyo</p>
                    </div>
                    <Button onClick={() => navigate("/mapa")} className="flex items-center gap-2 shrink-0">
                        <Map className="w-4 h-4" />
                        Abrir mapa
                    </Button>
                </section>

            </main>
        </div>
    );
};

export default UserHomePage;