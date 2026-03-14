import { useState } from "react";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-food.jpg";
import { Button } from "@/components/ui/button";
import { MapPin, UtensilsCrossed, ShoppingCart, Eye, Target, Heart, Clock, Phone, Star } from "lucide-react";
import LoginDialog from "@/components/LoginDialog";
import ThemeSwitcher from "@/components/ThemeSwitcher";

const restaurants = [
  {
    name: "Uramba Cocina",
    category: "Cocina tradicional del Pacífico",
    rating: 5,
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop",
    horario: "Mar–Dom: 12:00 PM – 9:00 PM",
    telefono: "+57 602 241 0000",
    direccion: "Centro, Buenaventura",
    domicilio: true,
    especialidad: "Ceviches, cazuela de mariscos, encocados",
  },
  {
    name: "Restaurante Café Pacífico",
    category: "Mariscos & Cocina local",
    rating: 4,
    image: "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?w=400&h=300&fit=crop",
    horario: "Lun–Sáb: 11:00 AM – 10:00 PM",
    telefono: "+57 602 242 3456",
    direccion: "Av. Simón Bolívar, Buenaventura",
    domicilio: true,
    especialidad: "Pescado frito, arroz con coco, jugo de borojó",
  },
  {
    name: "Restaurante Sabrosuras",
    category: "Comida criolla & Asados",
    rating: 5,
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop",
    horario: "Lun–Dom: 10:00 AM – 9:00 PM",
    telefono: "+57 602 243 7890",
    direccion: "Cl 6-62, Brr. El Dorado, Buenaventura",
    domicilio: true,
    especialidad: "Sancocho de pescado, arroz atollado, chuleta",
  },
  {
    name: "La Fonda Paisa",
    category: "Asadero & Cocina criolla",
    rating: 4,
    image: "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=400&h=300&fit=crop",
    horario: "Lun–Sáb: 7:00 AM – 8:00 PM",
    telefono: "+57 602 241 5678",
    direccion: "Centro, Buenaventura",
    domicilio: false,
    especialidad: "Bandeja paisa, mondongo, caldo de costilla",
  },
  {
    name: "Mariscos del Pacífico",
    category: "Mariscos & Ceviches",
    rating: 5,
    image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400&h=300&fit=crop",
    horario: "Mar–Dom: 11:00 AM – 9:00 PM",
    telefono: "+57 602 244 1234",
    direccion: "Zona portuaria, Buenaventura",
    domicilio: true,
    especialidad: "Ceviche de camarón, langostinos al ajillo, coctel de mariscos",
  },
  {
    name: "El Rincón Bonaverense",
    category: "Comida típica del Pacífico",
    rating: 4,
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop",
    horario: "Lun–Dom: 8:00 AM – 8:00 PM",
    telefono: "+57 602 242 9876",
    direccion: "Barrio El Carmen, Buenaventura",
    domicilio: true,
    especialidad: "Tapao de pescado, pusandao, aborrajados",
  },
];

const steps = [
  { icon: MapPin, title: "Encuentra comida", desc: "Explora restaurantes cercanos usando el mapa interactivo." },
  { icon: UtensilsCrossed, title: "Revisa el menú", desc: "Consulta precios, fotos y calificaciones de otros usuarios." },
  { icon: ShoppingCart, title: "Haz tu pedido", desc: "Ordena tu comida favorita fácilmente desde la plataforma." },
];

const Index = () => {
  const [loginOpen, setLoginOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-card shadow-nav">
        <div className="container flex items-center justify-between py-4">
          <span className="text-2xl font-bold text-primary">FoodMap</span>
          <nav className="hidden md:flex gap-6 items-center">
            <a href="#" className="text-foreground/80 hover:text-primary font-medium transition-colors">Inicio</a>
            <a href="#restaurants" className="text-foreground/80 hover:text-primary font-medium transition-colors">Restaurantes</a>
            <a href="#about" className="text-foreground/80 hover:text-primary font-medium transition-colors">Cómo funciona</a>
            <button
              onClick={() => setLoginOpen(true)}
              className="text-foreground/80 hover:text-primary font-medium transition-colors"
            >
              Iniciar sesión
            </button>
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
            <Button variant="hero" size="lg" onClick={() => navigate("/mapa")}>
              Buscar comida cerca
            </Button>
            <Button variant="heroOutline" size="lg" onClick={() => {
              document.getElementById("about")?.scrollIntoView({ behavior: "smooth" });
            }}>
              Cómo funciona
            </Button>
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
          <p className="text-center text-muted-foreground mb-14 text-lg">Los mejores lugares para comer en Buenaventura</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {restaurants.map((r, i) => (
              <div key={i} className="bg-card rounded-lg overflow-hidden shadow-card hover:shadow-lg transition-shadow">
                <img src={r.image} alt={r.name} className="w-full h-44 object-cover" loading="lazy" />
                <div className="p-5">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-lg font-semibold">{r.name}</h3>
                    <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                      {r.domicilio ? "Domicilio ✓" : "Solo local"}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-sm mb-2">{r.category}</p>
                  <div className="mb-3 flex items-center gap-1">
                    {Array.from({ length: r.rating }).map((_, j) => (
                      <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm text-foreground/80 mb-3 italic">"{r.especialidad}"</p>
                  <div className="space-y-1.5 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-primary" />
                      <span>{r.horario}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-primary" />
                      <span>{r.telefono}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-primary" />
                      <span>{r.direccion}</span>
                    </div>
                  </div>
                  <Button className="w-full">Ver menú</Button>
                </div>
              </div>
            ))}
          </div>
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
                FoodMap te permite explorar restaurantes y locales de comida en Buenaventura a través de un mapa interactivo. 
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
                Queremos ser la plataforma de referencia para encontrar comida en Buenaventura y el Pacífico colombiano. 
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
                puestos de comida y emprendimientos gastronómicos de Buenaventura. Queremos que cada negocio 
                tenga visibilidad digital y que cada persona encuentre su próxima comida favorita fácilmente.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-primary py-20 px-6 text-center">
        <div className="container max-w-2xl">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-8">
            La comida que buscas está más cerca de lo que crees
          </h2>
          <Button variant="heroOutline" size="lg" onClick={() => navigate("/mapa")}>
            Explorar restaurantes
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground py-10 text-center">
        <p className="text-background font-semibold">FoodMap © 2026</p>
        <p className="text-background/60 text-sm mt-1">Encuentra comida rápida cerca de ti en Buenaventura</p>
      </footer>

      {/* Login Dialog */}
      <LoginDialog open={loginOpen} onOpenChange={setLoginOpen} />
    </div>
  );
};

export default Index;
