import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-food.jpg";
import { Button } from "@/components/ui/button";
import { MapPin, UtensilsCrossed, ShoppingCart, Eye, Target, Heart, Clock, Star, ChevronDown } from "lucide-react";
import LoginDialog from "@/components/LoginDialog";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import RegisterDialog from "@/components/RegisterDialog";
import { isAuthenticated, getUsername, getRoles, logoutUser } from "@/services/auth";
import { useUserProfile } from "@/hooks/useProfile";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import SchemaOrg from "@/components/SchemaOrg";
import SEOHead from "@/components/SEOHead";
import { API_BASE_URL as API_BASE, SERVER_URL } from "@/config";



const steps = [
  { icon: MapPin, title: "Encuentra comida", desc: "Explora restaurantes cercanos usando el mapa interactivo." },
  { icon: UtensilsCrossed, title: "Revisa el menú", desc: "Consulta precios, fotos y calificaciones de otros usuarios." },
  { icon: ShoppingCart, title: "Haz tu pedido", desc: "Ordena tu comida favorita fácilmente desde la plataforma." },
];

const Index = () => {
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const navigate = useNavigate();

  const loggedIn = isAuthenticated();
  const username = getUsername();
  const roles = getRoles();
  const isAdmin = roles.includes("admin");

  const { data: profile } = useUserProfile({
    enabled: loggedIn,
  });


  const resolvedAvatar = profile?.avatar
    ? (profile.avatar.startsWith("http") ? profile.avatar : `${SERVER_URL}${profile.avatar}`)
    : null;

  // Restaurantes desde la API
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loadingRestaurants, setLoadingRestaurants] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/restaurantes/`)
      .then((res) => res.json())
      .then((data) => setRestaurants(Array.isArray(data) ? data : (data.results ?? [])))
      .catch(() => setRestaurants([]))
      .finally(() => setLoadingRestaurants(false));
  }, []);

  const initials = (profile?.nombre || profile?.username || username || "U")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleLogout = async () => {
    await logoutUser();
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* FT-91: Schema WebSite con searchbox */}
      <SEOHead
        title="FoodMap - Encuentra la mejor comida cerca de ti"
        description="Explora restaurantes, revisa su menú y haz pedidos fácilmente desde un mapa interactivo."
        url={window.location.origin}
      />
      <SchemaOrg schema={{
        "@type": "WebSite",
        "name": "FoodMap",
        "url": window.location.origin,
        "potentialAction": {
          "@type": "SearchAction",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": `${window.location.origin}/mapa?search={search_term_string}`
          },
          "query-input": "required name=search_term_string"
        }
      }} />
      {/* FT-89: Schema LocalBusiness */}
      <SchemaOrg schema={{
        "@type": "LocalBusiness",
        "name": "FoodMap",
        "description": "Plataforma para encontrar restaurantes cerca de ti",
        "url": window.location.origin,
      }} />
      <header className="sticky top-0 z-50 bg-card shadow-nav">
        <div className="container flex items-center justify-between py-4">
          <span className="text-2xl font-bold text-primary">FoodMap</span>
          <nav className="hidden md:flex gap-6 items-center">
            <a href="#" className="text-foreground/80 hover:text-primary font-medium transition-colors">Inicio</a>
            <a href="#restaurants" className="text-foreground/80 hover:text-primary font-medium transition-colors">Restaurantes</a>
            <a href="#about" className="text-foreground/80 hover:text-primary font-medium transition-colors">Cómo funciona</a>
            {loggedIn && (
              <button
                onClick={() => navigate("/mapa")}
                className="text-foreground/80 hover:text-primary font-medium transition-colors"
              >
                Ver Mapa
              </button>
            )}
            {loggedIn && isAdmin && (
              <button
                onClick={() => navigate("/admin")}
                className="text-primary font-bold transition-colors hover:opacity-80"
              >
                Panel Admin
              </button>
            )}
            {loggedIn && roles.includes("restaurante") && (
              <button
                onClick={() => navigate("/dashboard")}
                className="text-primary font-bold transition-colors hover:opacity-80"
              >
                Mi Restaurante
              </button>
            )}
            {loggedIn ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate("/perfil")}
                  className="relative focus:outline-none transition-transform hover:scale-105 rounded-full"
                  title="Mi Perfil"
                  aria-label="Ir a Mi Perfil"
                >
                  <Avatar className="w-9 h-9 border border-border shadow-sm ring-2 ring-primary/10">
                    {resolvedAvatar ? (
                      <AvatarImage src={resolvedAvatar} alt={profile?.nombre || username || "Avatar"} />
                    ) : null}
                    <AvatarFallback className="text-xs font-bold bg-primary/10 text-primary">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </button>
                <button
                  onClick={handleLogout}
                  className="text-muted-foreground hover:text-destructive font-medium transition-colors"
                >
                  Cerrar sesión
                </button>
              </div>
            ) : (
              <button
                onClick={() => setLoginOpen(true)}
                className="text-foreground/80 hover:text-primary font-medium transition-colors"
              >
                Iniciar sesión
              </button>
            )}
            <ThemeSwitcher />
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section
        className="relative flex items-center justify-center text-center min-h-screen"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.55)), url(${heroImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="max-w-3xl px-6 animate-fade-in-up">
          <h1 className="text-4xl md:text-6xl font-bold text-primary-foreground mb-6 leading-tight">
            Encuentra la mejor comida cerca de ti
          </h1>
          <p className="text-lg md:text-xl text-primary-foreground/85 mb-10">
            Explora restaurantes, revisa su menú y haz pedidos fácilmente desde un mapa interactivo.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button
              variant="hero"
              size="lg"
              onClick={() => {
                if (loggedIn) {
                  navigate("/mapa");
                } else {
                  toast.info("Por favor inicia sesión para acceder al mapa");
                  setLoginOpen(true);
                }
              }}
            >
              Ver mapa
            </Button>
            <Button variant="heroOutline" size="lg" onClick={() => {
              document.getElementById("about")?.scrollIntoView({ behavior: "smooth" });
            }}>
              Cómo funciona
            </Button>
          </div>

          {/* Scroll indicator */}
          <div
            className="mt-6 flex flex-col items-center gap-2 text-primary-foreground/40 cursor-pointer hover:text-primary-foreground/70 transition-colors animate-bounce mx-auto"
            onClick={() => document.getElementById("steps")?.scrollIntoView({ behavior: "smooth" })}
          >
            <span className="text-xs uppercase tracking-widest font-medium">Descubre más</span>
            <ChevronDown className="w-7 h-9" />
          </div>
        </div>
      </section>

      {/* Steps */}
      <section id="steps" className="bg-card py-20 px-6">
        <div className="container">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-14">Cómo funciona</h2>
          <div className="grid md:grid-cols-3 gap-10 max-w-4xl mx-auto">
            {steps.map((step, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5">
                  <step.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Restaurants */}
      <section id="restaurants" className="py-20 px-6">
        <div className="container">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Restaurantes destacados</h2>
          <p className="text-center text-muted-foreground mb-14 text-lg">Los mejores lugares para comer cerca de ti</p>

          {loadingRestaurants ? (
            <div className="text-center text-muted-foreground py-16">Cargando restaurantes...</div>
          ) : restaurants.length === 0 ? (
            <div className="text-center text-muted-foreground py-16">No hay restaurantes disponibles aún.</div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {restaurants.map((r) => {
                const rating = Math.round(r.calificacion_promedio || 0);
                const horario = r.horario
                  ? typeof r.horario === "string"
                    ? r.horario
                    : Object.entries(r.horario)
                      .map(([dia, hora]) => `${dia}: ${hora}`)
                      .join(" · ")
                  : "Consultar horario";
                const imagen = r.imagen
                  ? (r.imagen.startsWith("http") ? r.imagen : `${API_BASE}${r.imagen}`)
                  : "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop";

                return (
                  <div key={r.id} className="bg-card rounded-lg overflow-hidden shadow-card hover:shadow-lg transition-shadow">
                    <img src={imagen} alt={r.nombre} className="w-full h-44 object-cover" loading="lazy" />
                    <div className="p-5">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-lg font-semibold">{r.nombre}</h3>
                        {r.categoria && (
                          <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                            {r.categoria.icono} {r.categoria.nombre}
                          </span>
                        )}
                      </div>
                      {r.descripcion && (
                        <p className="text-muted-foreground text-sm mb-2">{r.descripcion}</p>
                      )}
                      <div className="mb-3 flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, j) => (
                          <Star
                            key={j}
                            className={`w-4 h-4 ${j < rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`}
                          />
                        ))}
                        {r.total_calificaciones > 0 && (
                          <span className="text-xs text-muted-foreground ml-1">({r.total_calificaciones})</span>
                        )}
                      </div>
                      <div className="space-y-1.5 text-sm text-muted-foreground mb-4">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                          <span className="truncate">{horario}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                          <span className="truncate">{r.direccion}</span>
                        </div>
                      </div>
                      <Button className="w-full" onClick={() => navigate(`/restaurante/${r.id}`)}>
                        Ver menú
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* About / Vision / Purpose */}
      <section id="about" className="bg-card py-20 px-6">
        <div className="container max-w-5xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-6">
            Sobre FoodMap
          </h2>
          <p className="text-center text-muted-foreground max-w-2xl mx-auto mb-16 text-lg">
            Conoce nuestra plataforma, cómo funciona y por qué la creamos.
          </p>

          <div className="grid md:grid-cols-3 gap-10">
            {/* How it works */}
            <div className="bg-background rounded-xl p-8 shadow-card">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-5">
                <Eye className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">¿Cómo funciona?</h3>
              <p className="text-muted-foreground leading-relaxed">
                FoodMap te permite explorar restaurantes y locales de comida a través de un mapa interactivo.
                Puedes ver el menú de cada lugar, leer calificaciones de otros usuarios y hacer tu pedido directamente desde la plataforma.
                Todo en pocos clics, desde tu celular o computador.
              </p>
            </div>

            {/* Vision */}
            <div className="bg-background rounded-xl p-8 shadow-card">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-5">
                <Target className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Nuestra visión</h3>
              <p className="text-muted-foreground leading-relaxed">
                Queremos ser la plataforma de referencia para encontrar comida en el Pacífico colombiano.
                Creemos que la tecnología puede acercar a las personas a los sabores locales, apoyando a pequeños negocios
                y transformando la forma en que la comunidad descubre nuevos lugares para comer.
              </p>
            </div>

            {/* Purpose */}
            <div className="bg-background rounded-xl p-8 shadow-card">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-5">
                <Heart className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Nuestro propósito</h3>
              <p className="text-muted-foreground leading-relaxed">
                Nuestro propósito es impulsar la economía local conectando a los usuarios con restaurantes,
                puestos de comida y emprendimientos gastronómicos locales. Queremos que cada negocio
                tenga visibilidad digital y que cada persona encuentre su próxima comida favorita fácilmente.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card py-10 text-center border-t border-border">
        <p className="text-primary font-semibold">FoodMap © 2026</p>
        <p className="text-primary/60 text-sm mt-1">Encuentra comida rápida cerca de ti</p>
      </footer>

      {/* Login Dialog */}
      <LoginDialog
        open={loginOpen}
        onOpenChange={setLoginOpen}
        onOpenRegister={() => setRegisterOpen(true)}
      />
      <RegisterDialog
        open={registerOpen}
        onOpenChange={setRegisterOpen}
        onSuccessLogin={() => setLoginOpen(true)}
      />
    </div>
  );
};

export default Index;