import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import api from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { X, Search, Filter } from 'lucide-react';
import useDebounce from '@/hooks/useDebounce';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';

interface Categoria {
  uuid: string;
  nombre: string;
  icono: string;
}

interface FilterBarProps {
  onSearchChange?: (search: string) => void;
  onCategoryChange?: (categories: string[]) => void;
  onRatingChange?: (rating: number | null) => void;
  onDistanceChange?: (distance: number | null) => void;
  userPosition?: { lat: number; lng: number };
  resultsCount?: number;
}

const FilterBar = ({
  onSearchChange,
  onCategoryChange,
  onRatingChange,
  onDistanceChange,
  userPosition,
  resultsCount = 0,
}: FilterBarProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    searchParams.get('categoria')?.split(',').filter(Boolean) || []
  );
  const [selectedRating, setSelectedRating] = useState<number | null>(
    searchParams.get('min_rating') ? parseInt(searchParams.get('min_rating')!) : null
  );
  const [selectedDistance, setSelectedDistance] = useState<number | null>(
    searchParams.get('radio') ? parseInt(searchParams.get('radio')!) : null
  );

  const debouncedSearch = useDebounce(searchInput, 400);

  const { data: categorias = [] } = useQuery({
    queryKey: ['categorias'],
    queryFn: async () => {
      const res = await api.get('/categorias/');
      return res.data;
    },
  });

  const distanceOptions = [
    { label: '1km', value: 1 },
    { label: '3km', value: 3 },
    { label: '5km', value: 5 },
    { label: '10km', value: 10 },
  ];

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
  };

  const handleCategoryToggle = (categoryId: string) => {
    const newCategories = selectedCategories.includes(categoryId)
      ? selectedCategories.filter(id => id !== categoryId)
      : [...selectedCategories, categoryId];
    setSelectedCategories(newCategories);
  };

  const handleRatingClick = (rating: number) => {
    const newRating = selectedRating === rating ? null : rating;
    setSelectedRating(newRating);
  };

  const handleDistanceClick = (distance: number) => {
    const newDistance = selectedDistance === distance ? null : distance;
    setSelectedDistance(newDistance);
  };

  const handleClearFilters = () => {
    setSearchInput('');
    setSelectedCategories([]);
    setSelectedRating(null);
    setSelectedDistance(null);
    setSearchParams({});
    onSearchChange?.('');
    onCategoryChange?.([]);
    onRatingChange?.(null);
    onDistanceChange?.(null);
  };

  // Update params when filters change
  const updateParams = () => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set('search', debouncedSearch);
    if (selectedCategories.length > 0) params.set('categoria', selectedCategories.join(','));
    if (selectedRating) params.set('min_rating', selectedRating.toString());
    if (selectedDistance && userPosition) {
      params.set('radio', selectedDistance.toString());
      params.set('lat', userPosition.lat.toString());
      params.set('lng', userPosition.lng.toString());
    }
    setSearchParams(params);
  };

  // Update filters whenever they change
  useMemo(() => {
    updateParams();
    onSearchChange?.(debouncedSearch);
    onCategoryChange?.(selectedCategories);
    onRatingChange?.(selectedRating);
    onDistanceChange?.(selectedDistance);
  }, [debouncedSearch, selectedCategories, selectedRating, selectedDistance]);

  const hasActiveFilters = searchInput || selectedCategories.length > 0 || selectedRating || selectedDistance;

  return (
    <div className="space-y-4">
      {/* Search Bar - Desktop */}
      <div className="hidden md:block">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar restaurante..."
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Filter Panel - Desktop */}
      <div className="hidden md:space-y-6">
        {/* Categories */}
        {categorias.length > 0 && (
          <div>
            <Label className="text-sm font-semibold mb-2 block">Categorías</Label>
            <div className="flex flex-wrap gap-2">
              {categorias.map((cat: Categoria) => (
                <Badge
                  key={cat.uuid}
                  variant={selectedCategories.includes(cat.uuid) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => handleCategoryToggle(cat.uuid)}
                >
                  {cat.icono} {cat.nombre}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Distance */}
        {userPosition && (
          <div>
            <Label className="text-sm font-semibold mb-2 block">Distancia Máxima</Label>
            <div className="flex flex-wrap gap-2">
              {distanceOptions.map((opt) => (
                <Button
                  key={opt.value}
                  variant={selectedDistance === opt.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleDistanceClick(opt.value)}
                >
                  {opt.label}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Rating */}
        <div>
          <Label className="text-sm font-semibold mb-2 block">Calificación Mínima</Label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                onClick={() => handleRatingClick(rating)}
                className="p-1 transition-transform hover:scale-110"
              >
                <Star
                  className={`w-6 h-6 ${
                    rating <= (selectedRating || 0)
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-muted-foreground'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        <div className="text-sm font-medium text-muted-foreground">
          {resultsCount} restaurante{resultsCount !== 1 ? 's' : ''} encontrado{resultsCount !== 1 ? 's' : ''}
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button variant="outline" size="sm" onClick={handleClearFilters} className="w-full">
            <X className="w-4 h-4 mr-2" />
            Limpiar Filtros
          </Button>
        )}
      </div>

      {/* Mobile Filter Drawer */}
      <div className="md:hidden flex items-center gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar..."
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        <Drawer>
          <DrawerTrigger asChild>
            <Button variant="outline" size="icon">
              <Filter className="w-4 h-4" />
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Filtros</DrawerTitle>
            </DrawerHeader>
            <div className="p-4 space-y-6">
              {/* Categories */}
              {categorias.length > 0 && (
                <div>
                  <Label className="text-sm font-semibold mb-2 block">Categorías</Label>
                  <div className="flex flex-wrap gap-2">
                    {categorias.map((cat: Categoria) => (
                      <Badge
                        key={cat.uuid}
                        variant={selectedCategories.includes(cat.uuid) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => handleCategoryToggle(cat.uuid)}
                      >
                        {cat.icono} {cat.nombre}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Distance */}
              {userPosition && (
                <div>
                  <Label className="text-sm font-semibold mb-2 block">Distancia</Label>
                  <div className="flex flex-wrap gap-2">
                    {distanceOptions.map((opt) => (
                      <Button
                        key={opt.value}
                        variant={selectedDistance === opt.value ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleDistanceClick(opt.value)}
                      >
                        {opt.label}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Rating */}
              <div>
                <Label className="text-sm font-semibold mb-2 block">Calificación</Label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => handleRatingClick(rating)}
                      className="p-1 transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          rating <= (selectedRating || 0)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-muted-foreground'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <Button variant="outline" size="sm" onClick={handleClearFilters} className="w-full">
                  <X className="w-4 h-4 mr-2" />
                  Limpiar Filtros
                </Button>
              )}
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    </div>
  );
};

export default FilterBar;
