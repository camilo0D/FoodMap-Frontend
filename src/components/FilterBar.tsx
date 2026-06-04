import { useState, useEffect, useCallback } from "react";
import { Search, Star, X, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer";

interface Category {
    id: string;
    nombre: string;
    icono: string;
}

interface FilterBarProps {
    categories: Category[];
    onFilterChange: (filters: {
        search: string;
        categorias: string[];
        minRating: number;
        distancia: number;
    }) => void;
    resultCount: number;
}

const DISTANCIAS = [1, 3, 5, 10];

const FilterBar = ({ categories, onFilterChange, resultCount }: FilterBarProps) => {
    const [search, setSearch] = useState("");
    const [categorias, setCategorias] = useState<string[]>([]);
    const [minRating, setMinRating] = useState(0);
    const [distancia, setDistancia] = useState(10);
    const [drawerOpen, setDrawerOpen] = useState(false);

    // FT-133: Debounce de 400ms para búsqueda
    useEffect(() => {
        const timer = setTimeout(() => {
            onFilterChange({ search, categorias, minRating, distancia });
        }, 400);
        return () => clearTimeout(timer);
    }, [search, categorias, minRating, distancia]);

    const toggleCategoria = (id: string) => {
        setCategorias((prev) =>
            prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
        );
    };

    // FT-139: Limpiar filtros
    const limpiarFiltros = () => {
        setSearch("");
        setCategorias([]);
        setMinRating(0);
        setDistancia(10);
    };

    const hayFiltrosActivos = search || categorias.length > 0 || minRating > 0 || distancia < 10;

    const FilterContent = () => (
        <div className="space-y-5">
            {/* FT-134: Chips de categorías */}
            <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Categorías</p>
                <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => toggleCategoria(cat.id)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${categorias.includes(cat.id)
                                    ? "bg-primary text-primary-foreground border-primary"
                                    : "bg-card text-foreground border-border hover:border-primary"
                                }`}
                        >
                            <span>{cat.icono}</span>
                            {cat.nombre}
                        </button>
                    ))}
                </div>
            </div>

            {/* FT-135: Slider de distancia */}
            <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    Distancia máxima: <span className="text-primary">{distancia} km</span>
                </p>
                <div className="flex items-center gap-3">
                    {DISTANCIAS.map((d) => (
                        <button
                            key={d}
                            onClick={() => setDistancia(d)}
                            className={`px-3 py-1 rounded-full text-xs font-bold border transition-all ${distancia === d
                                    ? "bg-primary text-primary-foreground border-primary"
                                    : "bg-card border-border hover:border-primary"
                                }`}
                        >
                            {d}km
                        </button>
                    ))}
                </div>
            </div>

            {/* FT-136: Filtro calificación mínima */}
            <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    Calificación mínima
                </p>
                <div className="flex items-center gap-2">
                    {[0, 1, 2, 3, 4, 5].map((r) => (
                        <button
                            key={r}
                            onClick={() => setMinRating(r)}
                            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border transition-all ${minRating === r
                                    ? "bg-primary text-primary-foreground border-primary"
                                    : "bg-card border-border hover:border-primary"
                                }`}
                        >
                            {r === 0 ? "Todos" : (
                                <>
                                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                    {r}+
                                </>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* FT-139: Botón limpiar */}
            {hayFiltrosActivos && (
                <Button variant="outline" size="sm" onClick={limpiarFiltros} className="w-full gap-2">
                    <X className="w-3.5 h-3.5" />
                    Limpiar filtros
                </Button>
            )}
        </div>
    );

    return (
        <div className="space-y-3">
            {/* FT-133: SearchBar */}
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar restaurante..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 bg-card border-border h-10"
                    />
                </div>

                {/* FT-137: Drawer en móvil */}
                <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
                    <DrawerTrigger asChild>
                        <Button variant="outline" size="icon" className={hayFiltrosActivos ? "border-primary text-primary" : ""}>
                            <SlidersHorizontal className="w-4 h-4" />
                        </Button>
                    </DrawerTrigger>
                    <DrawerContent>
                        <DrawerHeader>
                            <DrawerTitle>Filtros</DrawerTitle>
                        </DrawerHeader>
                        <div className="p-4 pb-8">
                            <FilterContent />
                        </div>
                    </DrawerContent>
                </Drawer>
            </div>

            {/* Filtros visibles en desktop */}
            <div className="hidden md:block">
                <FilterContent />
            </div>

            {/* FT-138: Indicador de resultados */}
            <p className="text-xs text-muted-foreground">
                <span className="font-bold text-foreground">{resultCount}</span> restaurante{resultCount !== 1 ? "s" : ""} encontrado{resultCount !== 1 ? "s" : ""}
                {hayFiltrosActivos && (
                    <button onClick={limpiarFiltros} className="ml-2 text-primary hover:underline">
                        Limpiar filtros
                    </button>
                )}
            </p>
        </div>
    );
};

export default FilterBar;