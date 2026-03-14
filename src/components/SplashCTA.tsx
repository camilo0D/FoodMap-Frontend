import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MapPin, ChevronDown } from "lucide-react";
import heroImage from "@/assets/hero-food.jpg";

const SplashCTA = ({ onEnter }: { onEnter: () => void }) => {
  const [exiting, setExiting] = useState(false);

  const handleEnter = () => {
    setExiting(true);
    setTimeout(onEnter, 600);
  };

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center text-center transition-all duration-600 ${
        exiting ? "opacity-0 scale-105" : "opacity-100 scale-100"
      }`}
      style={{
        backgroundImage: `linear-gradient(160deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.75) 100%), url(${heroImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        transitionProperty: "opacity, transform",
      }}
    >
      {/* Floating particles effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-64 h-64 rounded-full bg-primary/10 blur-3xl -top-20 -left-20 animate-pulse" />
        <div className="absolute w-96 h-96 rounded-full bg-primary/5 blur-3xl bottom-10 right-10 animate-pulse delay-1000" />
      </div>

      {/* Logo */}
      <div className="relative mb-8 animate-fade-in-up">
        <div className="w-20 h-20 rounded-2xl bg-primary/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-6 border border-primary/30">
          <MapPin className="w-10 h-10 text-primary" />
        </div>
        <span className="text-3xl font-bold text-primary tracking-wide">FoodMap</span>
      </div>

      {/* Headline */}
      <div className="max-w-2xl px-6 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-primary-foreground mb-6 leading-tight">
          Tu próxima comida favorita está aquí
        </h1>
        <p className="text-lg md:text-xl text-primary-foreground/75 mb-12 max-w-lg mx-auto">
          Descubre los mejores restaurantes y sabores de Buenaventura en un solo lugar.
        </p>
      </div>

      {/* CTA Button */}
      <div className="animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
        <Button
          variant="hero"
          size="lg"
          onClick={handleEnter}
          className="text-xl px-12 py-6 rounded-xl shadow-2xl hover:scale-105 transition-transform"
        >
          Explorar ahora
        </Button>
      </div>

      {/* Scroll hint */}
      <div
        className="absolute bottom-10 animate-bounce text-primary-foreground/50"
        style={{ animationDelay: "1s" }}
      >
        <ChevronDown className="w-8 h-8" />
      </div>
    </div>
  );
};

export default SplashCTA;
