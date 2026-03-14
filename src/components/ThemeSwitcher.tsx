import { useState, useEffect } from "react";
import { Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const themes = [
  { name: "Claro", value: "light", color: "#f5f5f5", border: "#ccc" },
  { name: "Oscuro", value: "dark", color: "#1a1a1a", border: "#444" },
  { name: "Morado", value: "purple", color: "#7c3aed", border: "#7c3aed" },
  { name: "Café", value: "brown", color: "#78350f", border: "#78350f" },
  { name: "Azul", value: "blue", color: "#2563eb", border: "#2563eb" },
];

const ThemeSwitcher = () => {
  const [theme, setTheme] = useState(() => localStorage.getItem("app-theme") || "light");

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("dark", "theme-purple", "theme-brown", "theme-blue");

    if (theme === "dark") root.classList.add("dark");
    else if (theme === "purple") root.classList.add("theme-purple");
    else if (theme === "brown") root.classList.add("theme-brown");
    else if (theme === "blue") root.classList.add("theme-blue");

    localStorage.setItem("app-theme", theme);
  }, [theme]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Palette className="w-5 h-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[140px]">
        {themes.map((t) => (
          <DropdownMenuItem
            key={t.value}
            onClick={() => setTheme(t.value)}
            className="flex items-center gap-3 cursor-pointer"
          >
            <span
              className="w-4 h-4 rounded-full border-2 shrink-0"
              style={{ backgroundColor: t.color, borderColor: t.border }}
            />
            <span>{t.name}</span>
            {theme === t.value && <span className="ml-auto text-primary">✓</span>}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ThemeSwitcher;
