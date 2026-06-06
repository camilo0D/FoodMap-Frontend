import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, Star, UtensilsCrossed, MapPin, User, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getRoles, isAuthenticated } from "@/services/auth";
import {
    fetchMyRestaurant,
    updateRestaurant,
    createRestaurant,
    fetchPlatos,
    createPlato,
    deletePlato,
    fetchResenasRestaurante,
    Plato,
} from "@/services/restaurant";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const LocationMarker = ({ position, setPosition }: any) => {
  useMapEvents({
    click(e) {
      setPosition({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return position === null ? null : <Marker position={position} />;
};


const API_BASE = "http://127.0.0.1:8000";

const DashboardPage = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const roles = getRoles();
    const isRestaurante = roles.includes("restaurante") || roles.includes("admin");


    useEffect(() => {
        if (!isAuthenticated() || !isRestaurante) {
            navigate("/");
        }
    }, []);

    if (!isAuthenticated() || !isRestaurante) {
        return null;
    }
    const [activeTab, setActiveTab] = useState<"perfil" | "menu" | "resenas">("perfil");

    // Fetch restaurante
    const { data: restaurante, isLoading } = useQuery({
        queryKey: ["my-restaurant"],
        queryFn: fetchMyRestaurant,
    });

    // Fetch platos
    const { data: platos = [] } = useQuery({
        queryKey: ["my-platos", restaurante?.id],
        queryFn: () => fetchPlatos(restaurante?.id || ""),
        enabled: !!restaurante?.id,
    });

    // Fetch reseñas
    const { data: resenasData } = useQuery({
        queryKey: ["my-resenas", restaurante?.id],
        queryFn: () => fetchResenasRestaurante(restaurante?.id || ""),
        enabled: !!restaurante?.id,
    });

    const resenas = resenasData?.results || resenasData || [];

    // Calcular % completitud del perfil (FT-123)
    const calcularCompletitud = () => {
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
        const completados = campos.filter(Boolean).length;
        return Math.round((completados / campos.length) * 100);
    };

    const completitud = calcularCompletitud();

    // Mutation actualizar restaurante
    const updateMutation = useMutation({
        mutationFn: (data: FormData) => updateRestaurant(restaurante?.id || "", data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["my-restaurant"] });
            toast.success("Restaurante actualizado correctamente");
        },
        onError: () => toast.error("Error al actualizar el restaurante"),
    });

    // Mutation crear restaurante
    const createRestaurantMutation = useMutation({
        mutationFn: (data: FormData) => createRestaurant(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["my-restaurant"] });
            toast.success("Restaurante creado correctamente");
        },
        onError: () => toast.error("Error al crear el restaurante"),
    });

    // Mutation crear plato
    const createPlatoMutation = useMutation({
        mutationFn: (data: FormData) => createPlato(restaurante?.id || "", data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["my-platos"] });
            toast.success("Plato creado correctamente");
            setNuevoPlato({ nombre: "", descripcion: "", precio: "", imagen: null });
        },
        onError: () => toast.error("Error al crear el plato"),
    });

    // Mutation eliminar plato
    const deletePlatoMutation = useMutation({
        mutationFn: (platoId: string) => deletePlato(restaurante?.id || "", platoId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["my-platos"] });
            toast.success("Plato eliminado correctamente");
        },
        onError: () => toast.error("Error al eliminar el plato"),
    });

    // Estado formulario perfil
    const [perfilForm, setPerfilForm] = useState({
        nombre: restaurante?.nombre || "",
        descripcion: restaurante?.descripcion || "",
        telefono: restaurante?.telefono || "",
        direccion: restaurante?.direccion || "",
    });
    const [imagenPreview, setImagenPreview] = useState<string | null>(null);
    const [imagenFile, setImagenFile] = useState<File | null>(null);
    const [mapPosition, setMapPosition] = useState<{lat: number, lng: number} | null>(null);

    useEffect(() => {
        if (restaurante?.latitud && restaurante?.longitud) {
            setMapPosition(prev => prev || { lat: Number(restaurante.latitud), lng: Number(restaurante.longitud) });
        } else if (!mapPosition) {
            setMapPosition({ lat: 4.711, lng: -74.0721 }); // Default to a central location
        }
    }, [restaurante]);


    // Estado formulario nuevo plato
    const [nuevoPlato, setNuevoPlato] = useState({
        nombre: "",
        descripcion: "",
        precio: "",
        imagen: null as File | null,
    });
    const [platoPreview, setPlatoPreview] = useState<string | null>(null);

    const handlePerfilSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData();
        const nombre = perfilForm.nombre || restaurante?.nombre || "";
        const descripcion = perfilForm.descripcion || restaurante?.descripcion || "";
        const telefono = perfilForm.telefono || restaurante?.telefono || "";
        const direccion = perfilForm.direccion || restaurante?.direccion || "";
        
        if (nombre) formData.append("nombre", nombre);
        if (descripcion) formData.append("descripcion", descripcion);
        if (telefono) formData.append("telefono", telefono);
        if (direccion) formData.append("direccion", direccion);
        if (mapPosition) {
            formData.append("latitud", mapPosition.lat.toString());
            formData.append("longitud", mapPosition.lng.toString());
        }
        
        if (restaurante) {
            updateMutation.mutate(formData);
        } else {
            createRestaurantMutation.mutate(formData);
        }
    };

    const handleImagenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImagenFile(file);
            setImagenPreview(URL.createObjectURL(file));
        }
    };

    const handlePlatoImagenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setNuevoPlato({ ...nuevoPlato, imagen: file });
            setPlatoPreview(URL.createObjectURL(file));
        }
    };

    const handleCrearPlato = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("nombre", nuevoPlato.nombre);
        formData.append("descripcion", nuevoPlato.descripcion);
        formData.append("precio", nuevoPlato.precio);
        formData.append("disponible", "true");
        if (nuevoPlato.imagen) formData.append("imagen", nuevoPlato.imagen);
        createPlatoMutation.mutate(formData);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <p className="text-muted-foreground">Cargando dashboard...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-card shadow-nav border-b border-border">
                <div className="container flex items-center gap-4 py-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <span className="text-xl font-bold text-primary">FoodMap</span>
                    <span className="text-muted-foreground text-sm">— Dashboard Restaurante</span>
                </div>
            </header>

            <main className="container py-8 max-w-4xl">
                {/* Info restaurante + completitud */}
                <div className="bg-card rounded-2xl p-6 border border-border mb-6 flex items-center gap-6">
                    {restaurante?.imagen ? (
                        <img src={restaurante.imagen.startsWith("http") ? restaurante.imagen : `${API_BASE}${restaurante.imagen}`}
                            alt={restaurante.nombre}
                            className="w-20 h-20 rounded-xl object-cover border border-border"
                        />
                    ) : (
                        <div className="w-20 h-20 rounded-xl bg-primary/10 flex items-center justify-center">
                            <UtensilsCrossed className="w-8 h-8 text-primary" />
                        </div>
                    )}
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold">{restaurante?.nombre || "Nuevo Restaurante"}</h1>
                        <p className="text-muted-foreground text-sm">{restaurante?.direccion || "Completa tus datos abajo"}</p>
                        {/* FT-123: Indicador completitud */}
                        <div className="mt-3">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-xs text-muted-foreground">Completitud del perfil</span>
                                <span className="text-xs font-bold text-primary">{completitud}%</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2">
                                <div
                                    className="bg-primary h-2 rounded-full transition-all"
                                    style={{ width: `${completitud}%` }}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                        <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                        <span className="font-bold">{restaurante?.calificacion_promedio || "0.0"}</span>
                        <span className="text-xs text-muted-foreground">{restaurante?.total_calificaciones || 0} reseñas</span>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6 border-b border-border">
                    {[
                        { key: "perfil", label: "Mi Perfil", icon: User },
                        { key: "menu", label: "Mi Menú", icon: UtensilsCrossed },
                        { key: "resenas", label: "Reseñas", icon: Star },
                    ].map(({ key, label, icon: Icon }) => (
                        <button
                            key={key}
                            disabled={!restaurante && key !== "perfil"}
                            onClick={() => setActiveTab(key as any)}
                            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === key
                                ? "border-primary text-primary"
                                : "border-transparent text-muted-foreground hover:text-foreground"
                                } ${!restaurante && key !== "perfil" ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                            <Icon className="w-4 h-4" />
                            {label}
                        </button>
                    ))}
                </div>

                {/* Tab: Perfil */}
                {activeTab === "perfil" && (
                    <form onSubmit={handlePerfilSubmit} className="bg-card rounded-2xl p-6 border border-border space-y-4">
                        <h2 className="text-lg font-bold mb-4">Editar Perfil</h2>

                        {/* Preview imagen */}
                        <div className="flex items-center gap-4">
                            <div className="w-24 h-24 rounded-xl overflow-hidden border border-border bg-muted">
                                {imagenPreview || restaurante?.imagen ? (
                                    <img
                                        src={imagenPreview || (restaurante?.imagen.startsWith("http") ? restaurante.imagen : `${API_BASE}${restaurante?.imagen}`)}
                                        className="w-full h-full object-cover"
                                        alt="Preview"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <UtensilsCrossed className="w-8 h-8 text-muted-foreground" />
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className="text-sm font-medium block mb-1">Logo del restaurante</label>
                                <input type="file" accept="image/*" onChange={handleImagenChange} className="text-sm" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium block mb-1">Nombre</label>
                                <input
                                    type="text"
                                    value={perfilForm.nombre || restaurante?.nombre || ""}
                                    onChange={(e) => setPerfilForm({ ...perfilForm, nombre: e.target.value })}
                                    className="w-full p-2 border border-border rounded-lg bg-background text-sm"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium block mb-1">Teléfono</label>
                                <input
                                    type="text"
                                    value={perfilForm.telefono || restaurante?.telefono || ""}
                                    onChange={(e) => setPerfilForm({ ...perfilForm, telefono: e.target.value })}
                                    className="w-full p-2 border border-border rounded-lg bg-background text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium block mb-1">Descripción</label>
                            <textarea
                                value={perfilForm.descripcion || restaurante?.descripcion || ""}
                                onChange={(e) => setPerfilForm({ ...perfilForm, descripcion: e.target.value })}
                                className="w-full p-2 border border-border rounded-lg bg-background text-sm min-h-[80px]"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium block mb-1">Dirección</label>
                            <input
                                type="text"
                                value={perfilForm.direccion || restaurante?.direccion || ""}
                                onChange={(e) => setPerfilForm({ ...perfilForm, direccion: e.target.value })}
                                className="w-full p-2 border border-border rounded-lg bg-background text-sm"
                            />
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <label className="text-sm font-medium block">Ubicación Precisa</label>
                                <span className="text-xs text-primary font-bold cursor-pointer hover:underline" onClick={() => {
                                    if (navigator.geolocation) {
                                        navigator.geolocation.getCurrentPosition((pos) => {
                                            setMapPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                                        });
                                    }
                                }}>Establecer con GPS</span>
                            </div>
                            <div className="h-[250px] w-full rounded-xl overflow-hidden border border-border relative z-0">
                                {mapPosition && (
                                    <MapContainer center={mapPosition} zoom={14} style={{ height: "100%", width: "100%" }}>
                                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                        <LocationMarker position={mapPosition} setPosition={setMapPosition} />
                                    </MapContainer>
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">Haz clic en el mapa para establecer el pin de la ubicación de tu restaurante.</p>
                        </div>

                        <Button type="submit" disabled={updateMutation.isPending || createRestaurantMutation.isPending}>
                            {updateMutation.isPending || createRestaurantMutation.isPending ? "Guardando..." : "Guardar cambios"}
                        </Button>
                    </form>
                )}

                {/* Tab: Menú */}
                {activeTab === "menu" && (
                    <div className="space-y-6">
                        {/* Formulario nuevo plato */}
                        <form onSubmit={handleCrearPlato} className="bg-card rounded-2xl p-6 border border-border space-y-4">
                            <h2 className="text-lg font-bold">Agregar nuevo plato</h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium block mb-1">Nombre</label>
                                    <input
                                        type="text"
                                        required
                                        value={nuevoPlato.nombre}
                                        onChange={(e) => setNuevoPlato({ ...nuevoPlato, nombre: e.target.value })}
                                        className="w-full p-2 border border-border rounded-lg bg-background text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium block mb-1">Precio</label>
                                    <input
                                        type="number"
                                        required
                                        value={nuevoPlato.precio}
                                        onChange={(e) => setNuevoPlato({ ...nuevoPlato, precio: e.target.value })}
                                        className="w-full p-2 border border-border rounded-lg bg-background text-sm"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium block mb-1">Descripción</label>
                                <input
                                    type="text"
                                    value={nuevoPlato.descripcion}
                                    onChange={(e) => setNuevoPlato({ ...nuevoPlato, descripcion: e.target.value })}
                                    className="w-full p-2 border border-border rounded-lg bg-background text-sm"
                                />
                            </div>
                            <div className="flex items-center gap-4">
                                {platoPreview && (
                                    <img src={platoPreview} className="w-16 h-16 rounded-lg object-cover border border-border" alt="Preview" />
                                )}
                                <div>
                                    <label className="text-sm font-medium block mb-1">Imagen del plato</label>
                                    <input type="file" accept="image/*" onChange={handlePlatoImagenChange} className="text-sm" />
                                </div>
                            </div>
                            <Button type="submit" disabled={createPlatoMutation.isPending}>
                                {createPlatoMutation.isPending ? "Creando..." : "Agregar plato"}
                            </Button>
                        </form>

                        {/* Lista de platos */}
                        <div className="bg-card rounded-2xl border border-border overflow-hidden">
                            <div className="p-4 border-b border-border">
                                <h2 className="font-bold">Platos actuales ({platos.length})</h2>
                            </div>
                            {platos.length === 0 ? (
                                <div className="p-8 text-center text-muted-foreground">
                                    <UtensilsCrossed className="w-10 h-10 mx-auto mb-2 opacity-40" />
                                    <p>No tienes platos en tu menú todavía.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-border">
                                    {platos.map((plato: Plato) => (
                                        <div key={plato.id} className="flex items-center gap-4 p-4">
                                            {plato.imagen ? (
                                                <img
                                                    src={plato.imagen.startsWith("http") ? plato.imagen : `${API_BASE}${plato.imagen}`}
                                                    className="w-12 h-12 rounded-lg object-cover border border-border"
                                                    alt={plato.nombre}
                                                />
                                            ) : (
                                                <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                                                    <UtensilsCrossed className="w-5 h-5 text-muted-foreground" />
                                                </div>
                                            )}
                                            <div className="flex-1">
                                                <p className="font-medium">{plato.nombre}</p>
                                                <p className="text-sm text-muted-foreground">{plato.descripcion}</p>
                                                <p className="text-sm font-bold text-primary">${Number(plato.precio).toLocaleString("es-CO")}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className={`text-xs px-2 py-1 rounded-full ${plato.disponible ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                                    {plato.disponible ? "Disponible" : "No disponible"}
                                                </span>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-destructive hover:text-destructive"
                                                    onClick={() => deletePlatoMutation.mutate(plato.id)}
                                                >
                                                    Eliminar
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Tab: Reseñas */}
                {activeTab === "resenas" && (
                    <div className="bg-card rounded-2xl border border-border overflow-hidden">
                        <div className="p-4 border-b border-border flex items-center justify-between">
                            <h2 className="font-bold">Reseñas recibidas ({resenas.length})</h2>
                            <div className="flex items-center gap-2">
                                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                                <span className="font-bold">{restaurante?.calificacion_promedio || "0.0"}</span>
                                <span className="text-sm text-muted-foreground">promedio</span>
                            </div>
                        </div>
                        {resenas.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground">
                                <Star className="w-10 h-10 mx-auto mb-2 opacity-40" />
                                <p>Aún no tienes reseñas.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-border">
                                {resenas.map((resena: any) => (
                                    <div key={resena.id} className="p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                                                    {(resena.usuario_username || "U").slice(0, 2).toUpperCase()}
                                                </div>
                                                <span className="font-medium text-sm">{resena.usuario_username}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                {Array.from({ length: 5 }).map((_, i) => (
                                                    <Star key={i} className={`w-3.5 h-3.5 ${i < resena.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`} />
                                                ))}
                                            </div>
                                        </div>
                                        {resena.comment && <p className="text-sm text-muted-foreground">{resena.comment}</p>}
                                        <p className="text-xs text-muted-foreground mt-1">{new Date(resena.created_at).toLocaleDateString("es-CO")}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default DashboardPage;