import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Star, UtensilsCrossed, LogOut, TrendingUp, Eye, Clock,
    ChevronRight, Plus, AlertCircle, CheckCircle2, BarChart3, Edit3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import { isAuthenticated, getRoles, getUsername, logoutUser } from "@/services/auth";
import { useQuery } from "@tanstack/react-query";
import {
    fetchMyRestaurant,
    fetchPlatos,
    fetchResenasRestaurante,
} from "@/services/restaurant";
import { SERVER_URL } from "@/config";
import { toast } from "sonner";

const API_BASE = SERVER_URL;

const RestaurantHomePage = () => {
    const navigate = useNavigate();
    const roles = getRoles();
    const username = getUsername();

    useEffect(() => {
        const isRest = roles.includes("restaurante") || roles.includes("admin");
        if (!isAuthenticated() || !isRest) {
            navigate("/");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const { data: restaurante, isLoading } = useQuery({
        queryKey: ["my-restaurant"],
        queryFn: fetchMyRestaurant,
    });

    const { data: platos = [] } = useQuery({
        queryKey: ["my-platos", restaurante?.id],
        queryFn: () => fetchPlatos(restaurante!.id),
        enabled: !!restaurante?.id,
    });

    const { data: resenasData } = useQuery({
        queryKey: ["my-resenas", restaurante?.id],
        queryFn: () => fetchResenasRestaurante(restaurante!.id),
        enabled: !!restaurante?.id,
    });

    const resenas = resenasData?.results || resenasData || [];

    const completitud = (() => {
        if (!restaurante) return 0;
        const campos = [
            restaurante.nombre,
            restaurante.descripcion,
            restaurante.telefono,
            restaurante.imagen,
            restaurante.direccion,
            restaurante.categoria,
            Object.keys(restaurante.horario || {}).length > 0,
        ];
        return Math.round((campos.filter(Boolean).length / campos.length) * 100);
    })();

    const handleLogout = async () => {
        await logoutUser();
        window.location.href = "/";
    };

    const hourNow = new Date().getHours();
    const greeting = hourNow < 12 ? "Buenos días" : hourNow < 18 ? "Buenas tardes" : "Buenas noches";

    const ratingDist = Array.from({ length: 5 }, (_, i) => ({
        stars: 5 - i,
        count: (resenas as any[]).filter((r: any) => r.rating === 5 - i).length,
    }));
    const maxCount = Math.max(...ratingDist.map((d) => d.count), 1);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-3 text-muted-foreground">
                    <UtensilsCrossed className="w-8 h-8 animate-pulse" />
                    <p className="text-sm">Cargando tu restaurante...</p>
                </div>
            </div>
        );
    }

    if (!restaurante) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 px-4 text-center">
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
                    <UtensilsCrossed className="w-8 h-8 text-muted-foreground" />
                </div>
                <h2 className="text-xl font-bold">Sin restaurante asignado</h2>
                <p className="text-sm text-muted-foreground max-w-sm">
                    Tu cuenta de restaurante aún no tiene un establecimiento asociado. Contacta al administrador de FoodMap para que lo asigne.
                </p>
                <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2">
                    <LogOut className="w-4 h-4" />
                    Cerrar sesión
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
                <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg overflow-hidden bg-primary/10 flex items-center justify-center">
                            {restaurante.imagen ? (
                                <img
                                    src={restaurante.imagen.startsWith("http") ? restaurante.imagen : `${API_BASE}${restaurante.imagen}`}
                                    className="w-full h-full object-cover"
                                    alt={restaurante.nombre}
                                />
                            ) : (
                                <UtensilsCrossed className="w-4 h-4 text-primary" />
                            )}
                        </div>
                        <span className="font-bold text-sm text-foreground truncate max-w-[160px]">{restaurante.nombre}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <ThemeSwitcher />
                        <Button variant="ghost" size="icon" onClick={handleLogout} title="Cerrar sesión">
                            <LogOut className="w-4 h-4 text-muted-foreground" />
                        </Button>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">

                {/* Bienvenida con estado */}
                <section className="bg-gradient-to-r from-orange-500 to-primary rounded-3xl p-6 text-white relative overflow-hidden">
                    <div className="absolute right-6 top-4 text-5xl opacity-20 select-none">🍽️</div>
                    <p className="text-white/70 text-sm">{greeting}, {username}</p>
                    <h1 className="text-2xl font-bold mt-1 mb-1">{restaurante.nombre}</h1>
                    <p className="text-white/70 text-sm mb-5">{restaurante.direccion || "Sin dirección registrada"}</p>
                    <div className="flex gap-3">
                        <Button
                            size="sm"
                            onClick={() => navigate("/dashboard")}
                            className="bg-white text-primary hover:bg-white/90 font-semibold text-xs flex items-center gap-1.5"
                        >
                            <Edit3 className="w-3.5 h-3.5" />
                            Gestionar
                        </Button>
                        <div className="flex items-center gap-1.5 bg-white/20 px-3 py-1.5 rounded-lg text-xs font-medium">
                            <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                            {restaurante.calificacion_promedio || "—"} · {(resenas as any[]).length} reseñas
                        </div>
                    </div>
                </section>

                {/* Completitud del perfil */}
                {completitud < 100 && (
                    <section className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 flex items-center gap-4">
                        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">Perfil {completitud}% completo</p>
                            <p className="text-xs text-amber-700 dark:text-amber-300">Completa tu perfil para que más clientes te encuentren</p>
                            <div className="mt-2 w-full bg-amber-200 dark:bg-amber-800 rounded-full h-1.5">
                                <div className="bg-amber-500 h-1.5 rounded-full transition-all" style={{ width: `${completitud}%` }} />
                            </div>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => navigate("/dashboard")} className="text-xs border-amber-400 text-amber-700 hover:bg-amber-100 shrink-0">
                            Completar
                        </Button>
                    </section>
                )}

                {/* KPIs */}
                <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        {
                            label: "Platos en menú", value: (platos as any[]).length,
                            icon: UtensilsCrossed, color: "text-primary", bg: "bg-primary/10",
                            action: () => navigate("/dashboard"),
                        },
                        {
                            label: "Reseñas totales", value: restaurante.total_calificaciones || 0,
                            icon: Star, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-900/20",
                            action: () => navigate("/dashboard"),
                        },
                        {
                            label: "Calificación", value: restaurante.calificacion_promedio || "—",
                            icon: TrendingUp, color: "text-green-500", bg: "bg-green-50 dark:bg-green-900/20",
                            action: null,
                        },
                        {
                            label: "Estado", value: restaurante.estado === "activo" ? "Activo" : "Inactivo",
                            icon: CheckCircle2,
                            color: restaurante.estado === "activo" ? "text-green-500" : "text-red-500",
                            bg: restaurante.estado === "activo" ? "bg-green-50 dark:bg-green-900/20" : "bg-red-50 dark:bg-red-900/20",
                            action: null,
                        },
                    ].map(({ label, value, icon: Icon, color, bg, action }) => (
                        <button
                            key={label}
                            onClick={action || undefined}
                            className={`bg-card border border-border rounded-2xl p-4 text-left transition-all ${action ? "hover:border-primary/30 hover:shadow-sm cursor-pointer" : "cursor-default"}`}
                        >
                            <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mb-3`}>
                                <Icon className={`w-4 h-4 ${color}`} />
                            </div>
                            <p className="text-xl font-bold">{value}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
                        </button>
                    ))}
                </section>

                {/* Acciones rápidas */}
                <section>
                    <h2 className="text-base font-bold mb-3">Acciones rápidas</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {[
                            { label: "Agregar plato", desc: "Añade un nuevo plato al menú", icon: Plus, action: () => navigate("/dashboard?tab=menu") },
                            { label: "Ver reseñas", desc: `${(resenas as any[]).length} opiniones de clientes`, icon: Star, action: () => navigate("/dashboard?tab=resenas") },
                            { label: "Editar perfil", desc: "Actualiza info y fotos", icon: Edit3, action: () => navigate("/dashboard?tab=perfil") },
                        ].map(({ label, desc, icon: Icon, action }) => (
                            <button
                                key={label}
                                onClick={action}
                                className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3 hover:border-primary/40 hover:shadow-sm transition-all text-left"
                            >
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                                    <Icon className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <p className="font-semibold text-sm">{label}</p>
                                    <p className="text-xs text-muted-foreground">{desc}</p>
                                </div>
                                <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto" />
                            </button>
                        ))}
                    </div>
                </section>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Distribución de ratings */}
                    <section className="bg-card border border-border rounded-2xl p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <BarChart3 className="w-4 h-4 text-primary" />
                            <h2 className="font-bold text-sm">Distribución de calificaciones</h2>
                        </div>
                        {(resenas as any[]).length === 0 ? (
                            <div className="text-center py-6 text-muted-foreground text-sm">
                                <Star className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                Aún no hay reseñas
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {ratingDist.map(({ stars, count }) => (
                                    <div key={stars} className="flex items-center gap-3">
                                        <span className="text-xs text-muted-foreground w-8 text-right">{stars}★</span>
                                        <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                                            <div
                                                className="bg-amber-400 h-2 rounded-full transition-all duration-500"
                                                style={{ width: `${(count / maxCount) * 100}%` }}
                                            />
                                        </div>
                                        <span className="text-xs text-muted-foreground w-4">{count}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Últimas reseñas */}
                    <section className="bg-card border border-border rounded-2xl p-5">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <Star className="w-4 h-4 text-primary" />
                                <h2 className="font-bold text-sm">Últimas opiniones</h2>
                            </div>
                            {(resenas as any[]).length > 2 && (
                                <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard?tab=resenas")} className="text-xs text-primary">
                                    Ver todas
                                </Button>
                            )}
                        </div>
                        {(resenas as any[]).length === 0 ? (
                            <div className="text-center py-6 text-muted-foreground text-sm">
                                <Star className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                Las reseñas aparecerán aquí
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {(resenas as any[]).slice(0, 2).map((r: any) => (
                                    <div key={r.id} className="p-3 bg-muted/50 rounded-xl">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="font-medium text-xs">{r.usuario_username}</span>
                                            <div className="flex">
                                                {Array.from({ length: 5 }).map((_, i) => (
                                                    <Star key={i} className={`w-3 h-3 ${i < r.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`} />
                                                ))}
                                            </div>
                                        </div>
                                        {r.comment && <p className="text-xs text-muted-foreground line-clamp-2">{r.comment}</p>}
                                        <p className="text-xs text-muted-foreground/50 mt-1 flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {new Date(r.created_at).toLocaleDateString("es-CO", { day: "numeric", month: "short" })}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </div>

                {/* Menú preview */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-base font-bold">Tu menú</h2>
                            <p className="text-xs text-muted-foreground">{(platos as any[]).length} platos disponibles</p>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard?tab=menu")} className="text-primary text-xs flex items-center gap-1">
                            Gestionar <ChevronRight className="w-3 h-3" />
                        </Button>
                    </div>

                    {(platos as any[]).length === 0 ? (
                        <div className="bg-card border border-dashed border-border rounded-2xl p-8 text-center">
                            <UtensilsCrossed className="w-10 h-10 mx-auto mb-2 text-muted-foreground/30" />
                            <p className="text-sm font-medium">Sin platos en el menú</p>
                            <p className="text-xs text-muted-foreground mt-1 mb-4">Agrega platos para que los clientes vean qué ofreces</p>
                            <Button size="sm" onClick={() => navigate("/dashboard?tab=menu")} className="text-xs">
                                <Plus className="w-3.5 h-3.5 mr-1" />
                                Agregar primer plato
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {(platos as any[]).slice(0, 4).map((p: any) => (
                                <div key={p.id} className="bg-card border border-border rounded-xl overflow-hidden">
                                    <div className="h-20 bg-muted overflow-hidden">
                                        {p.imagen ? (
                                            <img src={p.imagen.startsWith("http") ? p.imagen : `${API_BASE}${p.imagen}`} className="w-full h-full object-cover" alt={p.nombre} />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <UtensilsCrossed className="w-6 h-6 text-muted-foreground/30" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-2">
                                        <p className="font-medium text-xs truncate">{p.nombre}</p>
                                        <p className="text-xs text-primary font-bold">${Number(p.precio).toLocaleString("es-CO")}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

            </main>
        </div>
    );
};

export default RestaurantHomePage;