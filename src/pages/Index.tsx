import heroImage from "@/assets/hero-food.jpg";
import { Button } from "@/components/ui/button";
import { MapPin, UtensilsCrossed, ShoppingCart } from "lucide-react";

const restaurants = [
  {
    name: "Burger House",
    category: "Hamburguesas",
    rating: 5,
    image: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=400&h=300&fit=crop",
  },
  {
    name: "Pollo Express",
    category: "Pollo frito",
    rating: 4,
    image: "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?w=400&h=300&fit=crop",
  },
  {
    name: "Salchipapas 24/7",
    category: "Comida rápida",
    rating: 5,
    image: "https://images.unsplash.com/photo-1548365328-9f547fb0953c?w=400&h=300&fit=crop",
  },
];

const steps = [
  { icon: MapPin, title: "Encuentra comida", desc: "Explora restaurantes cercanos usando el mapa interactivo." },
  { icon: UtensilsCrossed, title: "Revisa el menú", desc: "Consulta precios, fotos y calificaciones de otros usuarios." },
  { icon: ShoppingCart, title: "Haz tu pedido", desc: "Ordena tu comida favorita fácilmente desde la plataforma." },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-card shadow-nav">
        <div className="container flex items-center justify-between py-4">
          <span className="text-2xl font-bold text-primary">FoodMap</span>
          <nav className="hidden md:flex gap-6">
            <a href="#" className="text-foreground/80 hover:text-primary font-medium transition-colors">Inicio</a>
            <a href="#restaurants" className="text-foreground/80 hover:text-primary font-medium transition-colors">Restaurantes</a>
            <a href="#steps" className="text-foreground/80 hover:text-primary font-medium transition-colors">Cómo funciona</a>
            <a href="#" className="text-foreground/80 hover:text-primary font-medium transition-colors">Iniciar sesión</a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section
        className="relative flex items-center justify-center text-center min-h-[90vh]"
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
            <Button variant="hero" size="lg">Buscar comida cerca</Button>
            <Button variant="heroOutline" size="lg">Cómo funciona</Button>
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
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-14">Restaurantes destacados</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {restaurants.map((r, i) => (
              <div key={i} className="bg-card rounded-lg overflow-hidden shadow-card hover:shadow-lg transition-shadow">
                <img src={r.image} alt={r.name} className="w-full h-44 object-cover" loading="lazy" />
                <div className="p-5">
                  <h3 className="text-lg font-semibold">{r.name}</h3>
                  <p className="text-muted-foreground text-sm mb-2">{r.category}</p>
                  <div className="mb-4 text-amber-400">
                    {"⭐".repeat(r.rating)}
                  </div>
                  <Button className="w-full">Ver menú</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-primary py-20 px-6 text-center">
        <div className="container max-w-2xl">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-8">
            La comida que buscas está más cerca de lo que crees
          </h2>
          <Button variant="heroOutline" size="lg">Explorar restaurantes</Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground py-10 text-center">
        <p className="text-background font-semibold">FoodMap © 2026</p>
        <p className="text-background/60 text-sm mt-1">Encuentra comida rápida cerca de ti</p>
      </footer>
    </div>
  );
};

export default Index;
