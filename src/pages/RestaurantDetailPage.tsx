import SchemaOrg from "@/components/SchemaOrg";
import SEOHead from "@/components/SEOHead";
import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import useEmblaCarousel from "embla-carousel-react";
import { useForm } from "react-hook-form";
import {
  Star, Clock, MapPin, Phone, ArrowLeft, Send,
  MessageSquare, UtensilsCrossed, ChevronLeft, ChevronRight, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import { getUsername, isAuthenticated } from "@/services/auth";

interface Review {
  id?: number;
  user: string;
  date: string;
  rating: number;
  text: string;
}

interface ReviewFormValues {
  rating: number;
  comment: string;
}

const API_URL = "http://127.0.0.1:8000/api";

const getMockImages = (categoryName: string, mainImage: string) => {
  const images = [];
  if (mainImage) images.push(mainImage);
  const cat = (categoryName || "").toLowerCase();
  let searchTerms: string[] = [];
  if (cat.includes("pizza")) {
    searchTerms = [
      "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1000&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1590947132387-155cc02f3212?w=1000&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=1000&auto=format&fit=crop&q=80"
    ];
  } else if (cat.includes("marisco") || cat.includes("ceviche") || cat.includes("pescado") || cat.includes("pacífico") || cat.includes("tradicional")) {
    searchTerms = [
      "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=1000&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=1000&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=1000&auto=format&fit=crop&q=80"
    ];
  } else if (cat.includes("hamburguesa") || cat.includes("rápida")) {
    searchTerms = [
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1000&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1550547660-d9450f859349?w=1000&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=1000&auto=format&fit=crop&q=80"
    ];
  } else if (cat.includes("café") || cat.includes("cafe")) {
    searchTerms = [
      "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=1000&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1498804103079-a6351b050096?w=1000&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=1000&auto=format&fit=crop&q=80"
    ];
  } else {
    searchTerms = [
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1000&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1544025162-d76694265947?w=1000&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1000&auto=format&fit=crop&q=80"
    ];
  }
  for (const url of searchTerms) {
    if (images.length >= 3) break;
    if (!images.includes(url)) images.push(url);
  }
  while (images.length < 3) {
    images.push("https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1000&auto=format&fit=crop&q=80");
  }
  return images;
};

const RestaurantDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "center" });
  const [prevBtnEnabled, setPrevBtnEnabled] = useState(false);
  const [nextBtnEnabled, setNextBtnEnabled] = useState(false);
  const queryClient = useQueryClient();
  const loggedIn = isAuthenticated();
  const loggedInUser = getUsername() || "Usuario";

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<ReviewFormValues>({
    defaultValues: { rating: 5, comment: "" }
  });

  const ratingValue = watch("rating");

  const { data: rest, isLoading, isError } = useQuery({
    queryKey: ["restaurant", id],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/restaurantes/${id}/`);
      if (!res.ok) throw new Error("Error fetching restaurant");
      return res.json();
    },
    staleTime: 1000 * 60 * 5,
  });

  // ✅ Hook aquí, ANTES de cualquier return condicional
  const { data: menuItems = [] } = useQuery({
    queryKey: ["menu", id],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/restaurantes/${id}/menu/`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!id,
  });

  const { data: reviewsData } = useQuery({
    queryKey: ["reviews", id],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/restaurantes/${id}/reviews/`);
      if (!res.ok) return { results: [] };
      return res.json();
    },
    enabled: !!id,
  });


  const scrollPrev = () => emblaApi && emblaApi.scrollPrev();
  const scrollNext = () => emblaApi && emblaApi.scrollNext();

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setPrevBtnEnabled(emblaApi.canScrollPrev());
    setNextBtnEnabled(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 bg-card border-b border-border">
          <div className="container py-4 flex items-center justify-between">
            <div className="w-24 h-8 bg-muted animate-pulse rounded" />
            <div className="w-16 h-8 bg-muted animate-pulse rounded" />
          </div>
        </header>
        <div className="container max-w-4xl py-8 px-4 space-y-6">
          <div className="w-full h-64 bg-muted animate-pulse rounded-2xl" />
          <div className="space-y-3">
            <div className="w-1/2 h-10 bg-muted animate-pulse rounded" />
            <div className="w-1/3 h-5 bg-muted animate-pulse rounded" />
          </div>
          <div className="border-t border-border pt-6 space-y-4">
            <div className="w-24 h-6 bg-muted animate-pulse rounded" />
            <div className="h-40 bg-muted animate-pulse rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !rest) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="sticky top-0 z-50 bg-card border-b border-border">
          <div className="container py-4 flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/mapa")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <span className="text-xl font-bold text-primary">FoodMap</span>
          </div>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
          <UtensilsCrossed className="w-16 h-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Restaurante no encontrado</h2>
          <p className="text-muted-foreground mb-6">El local de comida que buscas no existe o ha sido retirado.</p>
          <Button onClick={() => navigate("/mapa")}>Volver al mapa</Button>
        </div>
      </div>
    );
  }

  const categoryName = typeof rest.categoria === "string" ? rest.categoria : rest.categoria?.nombre || "Restaurante";
  const images = getMockImages(categoryName, rest.imagen);
  
  const apiReviews = reviewsData?.results || [];
  const allReviews: Review[] = apiReviews.map((r: any) => ({
    id: r.id,
    user: r.usuario_username,
    date: new Date(r.created_at).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" }),
    rating: r.rating,
    text: r.comment,
  }));
  
  const totalReviews = rest.total_calificaciones || 0;
  const averageRating = Number(rest.calificacion_promedio).toFixed(1);

  const onReviewSubmit = async (data: ReviewFormValues) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/restaurantes/${id}/reviews/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          rating: Number(data.rating),
          comment: data.comment
        })
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.non_field_errors?.[0] || errorData.error || "Error al publicar la reseña");
      }
      
      toast.success("¡Reseña publicada con éxito!");
      reset({ rating: 5, comment: "" });
      queryClient.invalidateQueries({ queryKey: ["reviews", id] });
      queryClient.invalidateQueries({ queryKey: ["restaurant", id] });
    } catch (error: any) {
      toast.error(error.message || "Hubo un problema al publicar tu reseña");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={`${rest.nombre} - FoodMap`}
        description={rest.descripcion || `${rest.nombre} en FoodMap`}
        url={`${window.location.origin}/restaurante/${rest.id}`}
        image={rest.imagen}
      />
      <SchemaOrg schema={{
        "@type": "Restaurant",
        "name": rest.nombre,
        "description": rest.descripcion,
        "address": { "@type": "PostalAddress", "streetAddress": rest.direccion },
        "geo": { "@type": "GeoCoordinates", "latitude": rest.latitud, "longitude": rest.longitud },
        "telephone": rest.telefono,
        "image": rest.imagen,
        "servesCuisine": categoryName,
      }} />
      <SchemaOrg schema={{
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Inicio", "item": window.location.origin },
          { "@type": "ListItem", "position": 2, "name": "Mapa", "item": `${window.location.origin}/mapa` },
          { "@type": "ListItem", "position": 3, "name": rest.nombre, "item": `${window.location.origin}/restaurante/${rest.id}` },
        ]
      }} />

      <header className="sticky top-0 z-50 bg-card/85 backdrop-blur-md border-b border-border/60 transition-colors">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/mapa")} className="text-muted-foreground hover:text-primary transition-colors rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <span className="text-xl font-bold text-primary">FoodMap</span>
          </div>
          <div className="flex items-center gap-4">
            <ThemeSwitcher />
          </div>
        </div>
      </header>

      <main className="container max-w-4xl py-6 px-4 space-y-8 animate-fade-in">
        <div className="flex items-center text-xs text-muted-foreground gap-2">
          <Link to="/" className="hover:text-primary transition-colors">Inicio</Link>
          <span>/</span>
          <Link to="/mapa" className="hover:text-primary transition-colors">Mapa</Link>
          <span>/</span>
          <span className="text-foreground font-medium truncate">{rest.nombre}</span>
        </div>

        <div className="relative group rounded-2xl overflow-hidden shadow-lg border border-border/40">
          <div className="embla overflow-hidden h-72 sm:h-96" ref={emblaRef}>
            <div className="flex h-full">
              {images.map((img, i) => (
                <div key={i} className="min-w-full relative h-full bg-slate-900">
                  <img src={img} className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" alt={`Galería de ${rest.nombre} - ${i + 1}`} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />
                </div>
              ))}
            </div>
          </div>
          {images.length > 1 && (
            <>
              <button onClick={scrollPrev} disabled={!prevBtnEnabled} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-card/90 border border-border flex items-center justify-center shadow-md hover:bg-primary hover:text-primary-foreground disabled:opacity-0 disabled:pointer-events-none transition-all duration-300 transform hover:scale-105 z-10" aria-label="Anterior imagen">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button onClick={scrollNext} disabled={!nextBtnEnabled} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-card/90 border border-border flex items-center justify-center shadow-md hover:bg-primary hover:text-primary-foreground disabled:opacity-0 disabled:pointer-events-none transition-all duration-300 transform hover:scale-105 z-10" aria-label="Siguiente imagen">
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {images.map((_, i) => (<span key={i} className="w-2.5 h-2.5 rounded-full bg-white/40 border border-white/20 transition-all duration-300" />))}
          </div>
        </div>

        <section className="bg-card rounded-2xl p-6 border border-border/60 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full pointer-events-none" />
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                {categoryName}
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">{rest.nombre}</h1>
              {rest.descripcion && <p className="mt-3 text-muted-foreground text-sm leading-relaxed max-w-2xl">{rest.descripcion}</p>}
            </div>
            <div className="flex items-center gap-2 bg-muted/30 border border-border/40 px-4 py-2.5 rounded-xl self-start shrink-0">
              <Star className="w-5 h-5 fill-amber-500 text-amber-500 animate-pulse" />
              <div className="text-right">
                <p className="text-sm font-bold text-foreground leading-none">{averageRating}</p>
                <p className="text-[10px] text-muted-foreground leading-none mt-1">{rest.total_calificaciones} opiniones</p>
              </div>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 border-t border-border/50 mt-6 pt-6 text-sm">
            <div className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors">
              <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center shrink-0"><MapPin className="w-4 h-4 text-primary" /></div>
              <span className="font-medium truncate" title={rest.direccion}>{rest.direccion}</span>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors">
              <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center shrink-0"><Clock className="w-4 h-4 text-primary" /></div>
              <span className="font-medium">
                {typeof rest.horario === "object"
                  ? Object.entries(rest.horario).map(([day, hrs]) => `${day}: ${hrs}`).join(" | ").slice(0, 35) + "..."
                  : rest.horario || "Horario no especificado"}
              </span>
            </div>
            {rest.telefono && (
              <div className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors">
                <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center shrink-0"><Phone className="w-4 h-4 text-primary" /></div>
                <a href={`tel:${rest.telefono}`} className="font-medium hover:underline hover:text-primary transition-all">{rest.telefono}</a>
              </div>
            )}
          </div>
        </section>

        <section className="bg-card rounded-2xl border border-border/60 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-border/50 flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2 text-foreground">
              <UtensilsCrossed className="w-5 h-5 text-primary" />
              Nuestra Carta / Menú
            </h2>
            <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider bg-muted/65 px-2.5 py-1 rounded-md">Precios Netos</span>
          </div>
          <div className="overflow-x-auto">
            {menuItems.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <UtensilsCrossed className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p className="text-sm">Este restaurante aún no ha registrado su menú.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-muted/15 border-b border-border/40 text-xs font-semibold text-muted-foreground uppercase">
                    <th className="py-3 px-6">Plato</th>
                    <th className="py-3 px-6 hidden sm:table-cell">Descripción</th>
                    <th className="py-3 px-6 text-right">Precio</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 text-sm">
                  {menuItems.map((item: any, i: number) => (
                    <tr key={i} className="hover:bg-muted/10 transition-colors group">
                      <td className="py-4 px-6 font-semibold text-foreground align-top">
                        <div className="flex items-center gap-2">
                          {item.nombre}
                          {!item.disponible && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-600 border border-red-200 shrink-0">No disponible</span>
                          )}
                        </div>
                        <span className="block text-xs text-muted-foreground mt-1 sm:hidden">{item.descripcion}</span>
                      </td>
                      <td className="py-4 px-6 text-muted-foreground max-w-md hidden sm:table-cell align-top">{item.descripcion}</td>
                      <td className="py-4 px-6 text-right font-bold text-foreground align-top group-hover:text-primary transition-colors">
                        ${Number(item.precio).toLocaleString("es-CO")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2 text-foreground">
              <MessageSquare className="w-5 h-5 text-primary" />
              Opiniones de Clientes
            </h2>
          </div>

          {loggedIn ? (
            <form onSubmit={handleSubmit(onReviewSubmit)} className="p-6 bg-card border border-border/60 rounded-2xl shadow-sm space-y-4 transition-colors">
              <div className="flex items-center justify-between border-b border-border/40 pb-3">
                <h3 className="font-bold text-foreground text-base">Escribe tu opinión</h3>
                <span className="text-xs text-muted-foreground">Publicando como <strong className="text-foreground font-bold">{loggedInUser}</strong></span>
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-semibold text-foreground">Calificación:</label>
                <div className="flex items-center gap-1.5 pt-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} type="button" onClick={() => setValue("rating", n)} className="focus:outline-none transition-transform duration-100 hover:scale-110 active:scale-95">
                      <Star className={`w-8 h-8 transition-colors ${n <= ratingValue ? "fill-amber-500 text-amber-500" : "text-muted-foreground/30 hover:text-amber-300"}`} />
                    </button>
                  ))}
                  <span className="text-xs text-muted-foreground ml-2 font-medium">
                    {ratingValue === 5 && "¡Excelente!"}{ratingValue === 4 && "Muy bueno"}{ratingValue === 3 && "Bueno"}{ratingValue === 2 && "Regular"}{ratingValue === 1 && "Malo"}
                  </span>
                </div>
              </div>
              <div className="space-y-1">
                <label htmlFor="comment" className="block text-sm font-semibold text-foreground">Comentario:</label>
                <textarea
                  id="comment"
                  {...register("comment", {
                    required: "Por favor escribe un comentario para enviar tu reseña.",
                    minLength: { value: 10, message: "El comentario debe tener al menos 10 caracteres." }
                  })}
                  className="w-full min-h-[100px] p-3.5 bg-background border border-border/80 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none resize-y"
                  placeholder="Comparte tu experiencia con este restaurante..."
                />
                {errors.comment && <p className="text-xs text-destructive font-medium mt-1">{errors.comment.message}</p>}
              </div>
              <div className="flex justify-end">
                <Button type="submit" className="flex items-center gap-2 font-bold px-6 py-2">
                  <Send className="w-4 h-4" />
                  Publicar Reseña
                </Button>
              </div>
            </form>
          ) : (
            <div className="p-6 bg-muted/40 border border-border/40 rounded-2xl text-center space-y-3">
              <p className="text-muted-foreground text-sm">Debes iniciar sesión para poder calificar este restaurante y compartir tu reseña.</p>
              <Button variant="outline" size="sm" onClick={() => navigate("/")} className="text-primary border-primary/30 hover:bg-primary hover:text-primary-foreground hover:border-transparent transition-all font-semibold">
                Iniciar sesión ahora
              </Button>
            </div>
          )}

          <div className="space-y-4">
            {allReviews.map((rev, i) => (
              <div key={i} className="bg-card border border-border/60 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold text-sm">
                      {rev.user.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground text-sm leading-tight">{rev.user}</h4>
                      <span className="text-[10px] text-muted-foreground mt-0.5 block">{rev.date}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <Star key={idx} className={`w-3.5 h-3.5 ${idx < rev.rating ? "fill-amber-500 text-amber-500" : "text-muted-foreground/30"}`} />
                    ))}
                  </div>
                </div>
                <p className="mt-4 text-foreground/85 text-sm leading-relaxed whitespace-pre-line pl-1">{rev.text}</p>
              </div>
            ))}
            {allReviews.length === 0 && (
              <div className="text-center py-12 text-muted-foreground bg-card border border-border/40 rounded-2xl">
                <MessageSquare className="w-12 h-12 mx-auto mb-2 text-muted-foreground/40" />
                <p className="text-sm">Aún no hay calificaciones para este restaurante.</p>
                <p className="text-xs mt-1">¡Sé el primero en compartir tu opinión!</p>
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="bg-card py-10 mt-16 text-center border-t border-border/60 transition-colors">
        <p className="text-primary font-semibold">FoodMap © 2026</p>
        <p className="text-muted-foreground text-sm mt-1">Encuentra y califica la mejor comida a tu alrededor</p>
      </footer>
    </div>
  );
};

export default RestaurantDetailPage;