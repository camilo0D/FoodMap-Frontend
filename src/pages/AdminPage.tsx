import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Users,
  Utensils,
  MessageSquare,
  Search,
  Trash2,
  MoreVertical,
  ArrowLeft,
  Eye,
  RefreshCw,
  Store,
  Star,
  User,
  Shield,
  Check,
  Ban,
  Activity,
  Layers,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import ConfirmDialog from "@/components/ConfirmDialog";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import {
  fetchAdminStats,
  fetchAdminUsers,
  fetchAdminUserById,
  updateUserStatusAndRole,
  deleteUser,
  fetchAdminRestaurants,
  updateRestaurantStatusAndCategory,
  deleteRestaurant,
  assignRestaurantOwner,
  AdminUser,
  AdminRestaurant,
  UserFilters,
  RestaurantFilters,
} from "@/services/admin";
import { getHomeRouteByRole } from "@/services/auth";

import { SERVER_URL } from "@/config";
const API_BASE = SERVER_URL;

const AdminPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Search and Filter States
  const [userSearch, setUserSearch] = useState("");
  const [userStatusFilter, setUserStatusFilter] = useState("all");
  const [userRoleFilter, setUserRoleFilter] = useState("all");

  const [restSearch, setRestSearch] = useState("");
  const [restStatusFilter, setRestStatusFilter] = useState("all");
  const [restCategoryFilter, setRestCategoryFilter] = useState("all");

  // Selection states for Dialogs and Modals
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState<AdminRestaurant | null>(null);
  const [loadingUserDetails, setLoadingUserDetails] = useState(false);

  // Modal asignar dueño
  const [assignOwnerRestId, setAssignOwnerRestId] = useState<string | null>(null);
  const [assignOwnerRestName, setAssignOwnerRestName] = useState("");
  const [ownerSearch, setOwnerSearch] = useState("");
  const [selectedOwnerId, setSelectedOwnerId] = useState<string | null>(null);

  // Effect: Refrescar datos del usuario cuando se abre el modal
  const selectedUserId = selectedUser?.id;
  useEffect(() => {
    if (selectedUserId) {
      setLoadingUserDetails(true);
      fetchAdminUserById(selectedUserId)
        .then((updatedUser) => {
          setSelectedUser(updatedUser);
        })
        .catch((error) => {
          console.error("Error refrescando detalles del usuario:", error);
          toast.error("Error al cargar los detalles actualizados del usuario");
        })
        .finally(() => {
          setLoadingUserDetails(false);
        });
    }
  }, [selectedUserId]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    type: "delete-user" | "delete-restaurant" | "suspend-user" | "suspend-restaurant";
    id: string;
    name: string;
  } | null>(null);

  // Queries
  const {
    data: stats,
    isLoading: statsLoading,
    isError: statsError,
  } = useQuery({
    queryKey: ["adminStats"],
    queryFn: fetchAdminStats,
  });

  const {
    data: users,
    isLoading: usersLoading,
    refetch: refetchUsers,
  } = useQuery({
    queryKey: ["adminUsers", userSearch, userStatusFilter, userRoleFilter],
    queryFn: () => {
      const filters: UserFilters = {};
      if (userSearch) filters.search = userSearch;
      if (userStatusFilter !== "all") filters.estado = userStatusFilter;
      if (userRoleFilter !== "all") filters.rol = userRoleFilter;
      return fetchAdminUsers(filters);
    },
  });

  const {
    data: restaurants,
    isLoading: restaurantsLoading,
    refetch: refetchRestaurants,
  } = useQuery({
    queryKey: ["adminRestaurants", restSearch, restStatusFilter, restCategoryFilter],
    queryFn: () => {
      const filters: RestaurantFilters = {};
      if (restSearch) filters.search = restSearch;
      if (restStatusFilter !== "all") filters.estado = restStatusFilter;
      if (restCategoryFilter !== "all") filters.categoria = restCategoryFilter;
      return fetchAdminRestaurants(filters);
    },
  });

  // Mutations
  const updateUserMutation = useMutation({
    mutationFn: ({ userId, estado, roles }: { userId: string; estado?: string; roles?: string[] }) =>
      updateUserStatusAndRole(userId, { estado, roles }),
    onSuccess: () => {
      toast.success("Usuario actualizado correctamente");
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      queryClient.invalidateQueries({ queryKey: ["adminStats"] });
    },
    onError: () => {
      toast.error("Error al actualizar el usuario");
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (userId: string) => deleteUser(userId),
    onSuccess: () => {
      toast.success("Usuario eliminado correctamente");
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      queryClient.invalidateQueries({ queryKey: ["adminStats"] });
    },
    onError: () => {
      toast.error("Error al eliminar el usuario");
    },
  });

  const updateRestMutation = useMutation({
    mutationFn: ({ restId, estado, categoria }: { restId: string; estado?: string; categoria?: string }) =>
      updateRestaurantStatusAndCategory(restId, { estado, categoria }),
    onSuccess: () => {
      toast.success("Restaurante actualizado correctamente");
      queryClient.invalidateQueries({ queryKey: ["adminRestaurants"] });
      queryClient.invalidateQueries({ queryKey: ["adminStats"] });
    },
    onError: () => {
      toast.error("Error al actualizar el restaurante");
    },
  });

  const deleteRestMutation = useMutation({
    mutationFn: (restId: string) => deleteRestaurant(restId),
    onSuccess: () => {
      toast.success("Restaurante eliminado correctamente");
      queryClient.invalidateQueries({ queryKey: ["adminRestaurants"] });
      queryClient.invalidateQueries({ queryKey: ["adminStats"] });
    },
    onError: () => {
      toast.error("Error al eliminar el restaurante");
    },
  });

  const assignOwnerMutation = useMutation({
    mutationFn: ({ restId, duenoId }: { restId: string; duenoId: string }) =>
      assignRestaurantOwner(restId, duenoId),
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ["adminRestaurants"] });
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      setAssignOwnerRestId(null);
      setSelectedOwnerId(null);
      setOwnerSearch("");
    },
    onError: () => {
      toast.error("Error al asignar el dueño");
    },
  });

  // Confirm Handlers
  const openConfirm = (
    type: "delete-user" | "delete-restaurant" | "suspend-user" | "suspend-restaurant",
    id: string,
    name: string
  ) => {
    setConfirmAction({ type, id, name });
    setConfirmOpen(true);
  };

  const handleConfirmAction = () => {
    if (!confirmAction) return;

    if (confirmAction.type === "delete-user") {
      deleteUserMutation.mutate(confirmAction.id);
    } else if (confirmAction.type === "delete-restaurant") {
      deleteRestMutation.mutate(confirmAction.id);
    } else if (confirmAction.type === "suspend-user") {
      updateUserMutation.mutate({ userId: confirmAction.id, estado: "suspendido" });
    } else if (confirmAction.type === "suspend-restaurant") {
      updateRestMutation.mutate({ restId: confirmAction.id, estado: "suspendido" });
    }

    setConfirmOpen(false);
    setConfirmAction(null);
  };

  // UI status dot indicator
  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    if (s === "activo") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/25">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Activo
        </span>
      );
    }
    if (s === "inactivo") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-500/10 text-slate-500 dark:bg-slate-500/25">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
          Inactivo
        </span>
      );
    }
    if (s === "suspendido") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-500 dark:bg-amber-500/25">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          Suspendido
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-500/10 text-rose-500 dark:bg-rose-500/25">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
        Eliminado
      </span>
    );
  };

  const getRoleBadge = (roleName: string) => {
    const name = roleName.toLowerCase();
    if (name === "admin") {
      return (
        <Badge variant="outline" className="bg-rose-500/10 text-rose-500 border-rose-500/30 font-semibold gap-1">
          <Shield className="w-3 h-3" /> Admin
        </Badge>
      );
    }
    if (name === "restaurante") {
      return (
        <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/30 font-semibold gap-1">
          <Store className="w-3 h-3" /> Restaurante
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="bg-slate-500/10 text-slate-500 border-slate-500/30 font-semibold gap-1">
        <User className="w-3 h-3" /> Usuario
      </Badge>
    );
  };

  const refreshAll = () => {
    queryClient.invalidateQueries({ queryKey: ["adminStats"] });
    refetchUsers();
    refetchRestaurants();
    toast.info("Datos actualizados");
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-12 transition-colors">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-card/85 backdrop-blur-md border-b border-border/60 shadow-nav">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(getHomeRouteByRole())}
              className="text-muted-foreground hover:text-primary transition-colors rounded-full"
              title="Volver a mi panel"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <span className="text-xl font-bold text-primary flex items-center gap-2">
                FoodMap
                <Badge className="bg-primary/20 text-primary border-none text-[10px] uppercase font-bold py-0.5 tracking-wider">
                  Admin
                </Badge>
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={refreshAll}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary border-border/60 hover:bg-muted"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Sincronizar
            </Button>
            <ThemeSwitcher />
          </div>
        </div>
      </header>

      <main className="container py-8 px-4 space-y-8 max-w-7xl animate-fade-in">
        {/* Title */}
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Panel de Control
          </h1>
          <p className="mt-1.5 text-muted-foreground text-sm">
            Monitorea métricas clave del sistema, administra cuentas de usuario y supervisa el estado de los restaurantes afiliados.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Card 1: Users */}
          <Card className="relative overflow-hidden group border border-border/50 bg-card/65 backdrop-blur shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
            <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-bl-full pointer-events-none group-hover:bg-primary/10 transition-colors" />
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Usuarios Registrados
              </CardTitle>
              <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-lg dark:bg-indigo-500/20">
                <Users className="w-5 h-5" />
              </div>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="h-8 w-16 bg-muted animate-pulse rounded mt-1" />
              ) : statsError ? (
                <p className="text-destructive text-sm font-semibold">Error</p>
              ) : (
                <>
                  <div className="text-3xl font-extrabold tracking-tight text-foreground">
                    {stats?.total_users}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1 font-medium">
                    Clientes, dueños y administradores
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Card 2: Restaurants */}
          <Card className="relative overflow-hidden group border border-border/50 bg-card/65 backdrop-blur shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
            <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-bl-full pointer-events-none group-hover:bg-primary/10 transition-colors" />
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Restaurantes Activos
              </CardTitle>
              <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg dark:bg-emerald-500/20">
                <Utensils className="w-5 h-5" />
              </div>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="h-8 w-16 bg-muted animate-pulse rounded mt-1" />
              ) : statsError ? (
                <p className="text-destructive text-sm font-semibold">Error</p>
              ) : (
                <>
                  <div className="text-3xl font-extrabold tracking-tight text-foreground">
                    {stats?.total_restaurants}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1 font-medium">
                    Locales visibles en el mapa
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Card 3: Reviews */}
          <Card className="relative overflow-hidden group border border-border/50 bg-card/65 backdrop-blur shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
            <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-bl-full pointer-events-none group-hover:bg-primary/10 transition-colors" />
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Reseñas Generadas
              </CardTitle>
              <div className="p-2 bg-amber-500/10 text-amber-500 rounded-lg dark:bg-amber-500/20">
                <MessageSquare className="w-5 h-5" />
              </div>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="h-8 w-16 bg-muted animate-pulse rounded mt-1" />
              ) : statsError ? (
                <p className="text-destructive text-sm font-semibold">Error</p>
              ) : (
                <>
                  <div className="text-3xl font-extrabold tracking-tight text-foreground">
                    {stats?.total_reviews}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1 font-medium">
                    Opiniones y calificaciones publicadas
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Card 4: Categories */}
          <Card className="relative overflow-hidden group border border-border/50 bg-card/65 backdrop-blur shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
            <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-bl-full pointer-events-none group-hover:bg-primary/10 transition-colors" />
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Categorías de Comida
              </CardTitle>
              <div className="p-2 bg-rose-500/10 text-rose-500 rounded-lg dark:bg-rose-500/20">
                <Layers className="w-5 h-5" />
              </div>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="h-8 w-16 bg-muted animate-pulse rounded mt-1" />
              ) : statsError ? (
                <p className="text-destructive text-sm font-semibold">Error</p>
              ) : (
                <>
                  <div className="text-3xl font-extrabold tracking-tight text-foreground">
                    {stats?.total_categories}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1 font-medium">
                    Tipos de locales registrados
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Tabs Control */}
        <Tabs defaultValue="users" className="w-full space-y-6">
          <TabsList className="bg-muted/65 p-1 rounded-xl grid grid-cols-2 max-w-[400px] border border-border/45">
            <TabsTrigger value="users" className="rounded-lg font-bold text-sm">
              Gestión de Usuarios
            </TabsTrigger>
            <TabsTrigger value="restaurants" className="rounded-lg font-bold text-sm">
              Gestión de Restaurantes
            </TabsTrigger>
          </TabsList>

          {/* Users View */}
          <TabsContent value="users" className="space-y-4">
            {/* Filters Row */}
            <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
              {/* Search box */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por usuario o correo electrónico..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="pl-9 bg-card border-border/80 focus-visible:ring-primary rounded-xl"
                />
              </div>

              {/* Select drop downs */}
              <div className="flex flex-wrap items-center gap-3">
                {/* State selector */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-muted-foreground">Estado:</span>
                  <Select value={userStatusFilter} onValueChange={setUserStatusFilter}>
                    <SelectTrigger className="w-[140px] bg-card border-border/80 rounded-xl text-xs font-medium">
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="activo">Activos</SelectItem>
                      <SelectItem value="inactivo">Inactivos</SelectItem>
                      <SelectItem value="suspendido">Suspendidos</SelectItem>
                      <SelectItem value="eliminado">Eliminados</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Role selector */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-muted-foreground">Rol:</span>
                  <Select value={userRoleFilter} onValueChange={setUserRoleFilter}>
                    <SelectTrigger className="w-[140px] bg-card border-border/80 rounded-xl text-xs font-medium">
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="admin">Administrador</SelectItem>
                      <SelectItem value="restaurante">Restaurante</SelectItem>
                      <SelectItem value="usuario">Usuario común</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-card border border-border/60 rounded-2xl overflow-hidden shadow-sm">
              {usersLoading ? (
                <div className="p-8 space-y-4">
                  <div className="h-6 bg-muted animate-pulse rounded w-1/3" />
                  <div className="h-10 bg-muted animate-pulse rounded w-full" />
                  <div className="h-10 bg-muted animate-pulse rounded w-full" />
                  <div className="h-10 bg-muted animate-pulse rounded w-full" />
                </div>
              ) : users && users.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-muted/15 border-b border-border/40">
                      <TableRow>
                        <TableHead className="font-bold">Usuario</TableHead>
                        <TableHead className="font-bold">Correo Electrónico</TableHead>
                        <TableHead className="font-bold">Roles</TableHead>
                        <TableHead className="font-bold">Estado</TableHead>
                        <TableHead className="font-bold">Fecha Registro</TableHead>
                        <TableHead className="text-right font-bold">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-border/40">
                      {users.map((user) => (
                        <TableRow key={user.id} className="hover:bg-muted/10 transition-colors">
                          <TableCell className="font-medium align-middle">
                            <div className="flex items-center gap-3">
                              {user.avatar ? (
                                <img
                                  src={user.avatar.startsWith("http") ? user.avatar : `${API_BASE}${user.avatar}`}
                                  alt={user.nombre || user.username}
                                  className="w-8 h-8 rounded-full object-cover border border-border/40 shrink-0"
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs uppercase border border-primary/20 shrink-0">
                                  {(user.nombre || user.username).slice(0, 2).toUpperCase()}
                                </div>
                              )}
                              <div className="flex flex-col">
                                <span className="font-bold">{user.nombre || user.username}</span>
                                {user.nombre && (
                                  <span className="text-[10px] text-muted-foreground">@{user.username}</span>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="align-middle text-muted-foreground">{user.email || "-"}</TableCell>
                          <TableCell className="align-middle">
                            <div className="flex flex-wrap gap-1.5">
                              {user.roles && user.roles.length > 0 ? (
                                user.roles.map((r) => <React.Fragment key={r}>{getRoleBadge(r)}</React.Fragment>)
                              ) : (
                                <span className="text-xs text-muted-foreground italic">Ninguno</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="align-middle">{getStatusBadge(user.estado)}</TableCell>
                          <TableCell className="align-middle text-xs text-muted-foreground">
                            {user.created_at
                              ? new Date(user.created_at).toLocaleDateString("es-ES", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })
                              : "-"}
                          </TableCell>
                          <TableCell className="text-right align-middle">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* View Profile */}
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setSelectedUser(user)}
                                className="w-8 h-8 rounded-lg hover:text-primary shrink-0"
                                title="Ver Perfil"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>

                              {/* Action Options Dropdown */}
                              {user.estado !== "eliminado" && (
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground shrink-0"
                                    >
                                      <MoreVertical className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-[180px] rounded-xl border border-border bg-card">
                                    <DropdownMenuLabel className="text-xs text-muted-foreground">Cambiar Estado</DropdownMenuLabel>
                                    <DropdownMenuItem
                                      onClick={() => updateUserMutation.mutate({ userId: user.id, estado: "activo" })}
                                      className="gap-2 text-xs"
                                    >
                                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                                      Activar
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => updateUserMutation.mutate({ userId: user.id, estado: "inactivo" })}
                                      className="gap-2 text-xs"
                                    >
                                      <Ban className="w-3.5 h-3.5 text-slate-500" />
                                      Desactivar
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => openConfirm("suspend-user", user.id, user.username)}
                                      className="gap-2 text-xs text-amber-500 hover:text-amber-500"
                                    >
                                      <Activity className="w-3.5 h-3.5" />
                                      Suspender
                                    </DropdownMenuItem>

                                    <DropdownMenuSeparator />
                                    <DropdownMenuLabel className="text-xs text-muted-foreground">Cambiar Rol</DropdownMenuLabel>
                                    <DropdownMenuItem
                                      onClick={() =>
                                        updateUserMutation.mutate({
                                          userId: user.id,
                                          roles: ["usuario"],
                                        })
                                      }
                                      className="gap-2 text-xs"
                                    >
                                      <User className="w-3.5 h-3.5" />
                                      Hacer Usuario
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() =>
                                        updateUserMutation.mutate({
                                          userId: user.id,
                                          roles: user.roles.includes("admin") ? ["usuario"] : ["admin"],
                                        })
                                      }
                                      className="gap-2 text-xs"
                                    >
                                      <Shield className="w-3.5 h-3.5" />
                                      {user.roles.includes("admin") ? "Quitar Admin" : "Hacer Admin"}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() =>
                                        updateUserMutation.mutate({
                                          userId: user.id,
                                          roles: user.roles.includes("restaurante") ? ["usuario"] : ["restaurante"],
                                        })
                                      }
                                      className="gap-2 text-xs"
                                    >
                                      <Store className="w-3.5 h-3.5" />
                                      {user.roles.includes("restaurante") ? "Quitar Restaurante" : "Hacer Restaurante"}
                                    </DropdownMenuItem>

                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      onClick={() => openConfirm("delete-user", user.id, user.username)}
                                      className="gap-2 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                      Eliminar (Soft Delete)
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="p-12 text-center text-muted-foreground space-y-2">
                  <Users className="w-12 h-12 mx-auto text-muted-foreground/30" />
                  <p className="font-semibold text-sm">No se encontraron usuarios</p>
                  <p className="text-xs">Prueba ajustando los filtros o la consulta de búsqueda.</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Restaurants View */}
          <TabsContent value="restaurants" className="space-y-4">
            {/* Filters Row */}
            <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
              {/* Search box */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar restaurantes por nombre..."
                  value={restSearch}
                  onChange={(e) => setRestSearch(e.target.value)}
                  className="pl-9 bg-card border-border/80 focus-visible:ring-primary rounded-xl"
                />
              </div>

              {/* Select drop downs */}
              <div className="flex flex-wrap items-center gap-3">
                {/* State selector */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-muted-foreground">Estado:</span>
                  <Select value={restStatusFilter} onValueChange={setRestStatusFilter}>
                    <SelectTrigger className="w-[140px] bg-card border-border/80 rounded-xl text-xs font-medium">
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="activo">Activos</SelectItem>
                      <SelectItem value="inactivo">Inactivos</SelectItem>
                      <SelectItem value="suspendido">Suspendidos</SelectItem>
                      <SelectItem value="eliminado">Eliminados</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Category selector */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-muted-foreground">Categoría:</span>
                  <Select value={restCategoryFilter} onValueChange={setRestCategoryFilter}>
                    <SelectTrigger className="w-[170px] bg-card border-border/80 rounded-xl text-xs font-medium">
                      <SelectValue placeholder="Todas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      {stats?.categories?.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Restaurants Table */}
            <div className="bg-card border border-border/60 rounded-2xl overflow-hidden shadow-sm">
              {restaurantsLoading ? (
                <div className="p-8 space-y-4">
                  <div className="h-6 bg-muted animate-pulse rounded w-1/3" />
                  <div className="h-10 bg-muted animate-pulse rounded w-full" />
                  <div className="h-10 bg-muted animate-pulse rounded w-full" />
                </div>
              ) : restaurants && restaurants.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-muted/15 border-b border-border/40">
                      <TableRow>
                        <TableHead className="font-bold">Restaurante</TableHead>
                        <TableHead className="font-bold">Categoría</TableHead>
                        <TableHead className="font-bold">Dueño (Owner)</TableHead>
                        <TableHead className="font-bold">Calificación</TableHead>
                        <TableHead className="font-bold">Estado</TableHead>
                        <TableHead className="text-right font-bold">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-border/40">
                      {restaurants.map((rest) => (
                        <TableRow key={rest.id} className="hover:bg-muted/10 transition-colors">
                          <TableCell className="font-medium align-middle">
                            <div className="flex items-center gap-3">
                              {rest.imagen ? (
                                <img
                                  src={rest.imagen}
                                  alt={rest.nombre}
                                  className="w-10 h-10 object-cover rounded-lg border border-border/40 shrink-0"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
                                  <Utensils className="w-5 h-5" />
                                </div>
                              )}
                              <div>
                                <span className="font-bold block text-sm">{rest.nombre}</span>
                                <span className="text-[10px] text-muted-foreground block truncate max-w-xs">
                                  {rest.direccion}
                                </span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="align-middle">
                            <Badge variant="secondary" className="bg-muted text-muted-foreground border-none font-medium">
                              {rest.categoria}
                            </Badge>
                          </TableCell>
                          <TableCell className="align-middle">
                            <div>
                              <span className="font-bold text-xs block">{rest.dueno}</span>
                              <span className="text-[10px] text-muted-foreground block">{rest.dueno_email || "-"}</span>
                            </div>
                          </TableCell>
                          <TableCell className="align-middle">
                            <div className="flex items-center gap-1.5">
                              <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                              <span className="font-bold text-xs">{Number(rest.calificacion_promedio).toFixed(1)}</span>
                              <span className="text-[10px] text-muted-foreground">
                                ({rest.total_calificaciones})
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="align-middle">{getStatusBadge(rest.estado)}</TableCell>
                          <TableCell className="text-right align-middle">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* View Restaurant Page */}
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => navigate(`/restaurante/${rest.id}`)}
                                className="w-8 h-8 rounded-lg hover:text-primary shrink-0"
                                title="Ver Ficha"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>

                              {/* Dropdown Options */}
                              {rest.estado !== "eliminado" && (
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground shrink-0"
                                    >
                                      <MoreVertical className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-[180px] rounded-xl border border-border bg-card">
                                    <DropdownMenuLabel className="text-xs text-muted-foreground">Cambiar Estado</DropdownMenuLabel>
                                    <DropdownMenuItem
                                      onClick={() => updateRestMutation.mutate({ restId: rest.id, estado: "activo" })}
                                      className="gap-2 text-xs"
                                    >
                                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                                      Activar
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => updateRestMutation.mutate({ restId: rest.id, estado: "inactivo" })}
                                      className="gap-2 text-xs"
                                    >
                                      <Ban className="w-3.5 h-3.5 text-slate-500" />
                                      Desactivar
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => openConfirm("suspend-restaurant", rest.id, rest.nombre)}
                                      className="gap-2 text-xs text-amber-500 hover:text-amber-500"
                                    >
                                      <Activity className="w-3.5 h-3.5" />
                                      Suspender
                                    </DropdownMenuItem>

                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setAssignOwnerRestId(rest.id);
                                        setAssignOwnerRestName(rest.nombre);
                                        setSelectedOwnerId(null);
                                        setOwnerSearch("");
                                      }}
                                      className="gap-2 text-xs text-blue-500 hover:text-blue-500"
                                    >
                                      <UserCheck className="w-3.5 h-3.5" />
                                      Asignar dueño
                                    </DropdownMenuItem>

                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      onClick={() => openConfirm("delete-restaurant", rest.id, rest.nombre)}
                                      className="gap-2 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                      Eliminar (Soft Delete)
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="p-12 text-center text-muted-foreground space-y-2">
                  <Store className="w-12 h-12 mx-auto text-muted-foreground/30" />
                  <p className="font-semibold text-sm">No se encontraron restaurantes</p>
                  <p className="text-xs">Prueba ajustando los filtros o la consulta de búsqueda.</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* User profile details Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
        <DialogContent className="sm:max-w-[450px] border border-border bg-card rounded-2xl">
          <DialogHeader className="border-b border-border/40 pb-4 flex flex-row items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Detalle del Perfil
              </DialogTitle>
              <DialogDescription className="text-xs mt-1">
                Información registrada del usuario en el sistema.
              </DialogDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                if (selectedUser) {
                  setLoadingUserDetails(true);
                  fetchAdminUserById(selectedUser.id)
                    .then((updatedUser) => {
                      setSelectedUser(updatedUser);
                      toast.success("Datos actualizados");
                    })
                    .catch((error) => {
                      console.error("Error refrescando:", error);
                      toast.error("Error al actualizar");
                    })
                    .finally(() => {
                      setLoadingUserDetails(false);
                    });
                }
              }}
              disabled={loadingUserDetails}
              title="Actualizar datos del usuario"
            >
              <RefreshCw className={`w-4 h-4 ${loadingUserDetails ? "animate-spin" : ""}`} />
            </Button>
          </DialogHeader>

          {loadingUserDetails ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-10 h-10 rounded-full border-2 border-muted border-t-primary animate-spin mx-auto" />
              <p className="text-sm text-muted-foreground font-medium">Cargando datos actualizados...</p>
            </div>
          ) : selectedUser ? (
            <div className="py-4 space-y-5 text-sm">
              <div className="flex items-center gap-4">
                {selectedUser.avatar ? (
                  <img
                    src={
                      selectedUser.avatar.startsWith("http")
                        ? selectedUser.avatar
                        : `${API_BASE}${selectedUser.avatar}`
                    }
                    alt={selectedUser.nombre || selectedUser.username}
                    className="w-14 h-14 rounded-full border-2 border-primary/20 object-cover shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg uppercase border border-primary/20 shrink-0">
                    {selectedUser.username.slice(0, 2)}
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-bold text-base leading-tight">{selectedUser.nombre || selectedUser.username}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">@{selectedUser.username}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{selectedUser.email || "Sin correo"}</p>
                </div>
              </div>

              {selectedUser.bio && (
                <div className="border-t border-border/40 pt-4">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                    Biografía
                  </span>
                  <p className="text-xs text-foreground mt-1.5 leading-relaxed">{selectedUser.bio}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 border-t border-border/40 pt-4">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                    Estado Actual
                  </span>
                  <div className="pt-0.5">{getStatusBadge(selectedUser.estado)}</div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                    Roles Asignados
                  </span>
                  <div className="flex flex-wrap gap-1 pt-0.5">
                    {selectedUser.roles?.map((r) => (
                      <React.Fragment key={r}>{getRoleBadge(r)}</React.Fragment>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                    Fecha de Registro
                  </span>
                  <p className="text-xs font-semibold text-foreground pt-0.5">
                    {selectedUser.created_at
                      ? new Date(selectedUser.created_at).toLocaleDateString("es-ES", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                      : "No disponible"}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                    ID del Usuario (UUID)
                  </span>
                  <p className="text-[10px] font-mono text-muted-foreground pt-0.5 break-all">
                    {selectedUser.id}
                  </p>
                </div>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Modal: Asignar dueño a restaurante */}
      <Dialog open={!!assignOwnerRestId} onOpenChange={(open) => { if (!open) { setAssignOwnerRestId(null); setSelectedOwnerId(null); setOwnerSearch(""); } }}>
        <DialogContent className="sm:max-w-[480px] border border-border bg-card rounded-2xl">
          <DialogHeader className="border-b border-border/40 pb-4">
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-blue-500" />
              Asignar dueño
            </DialogTitle>
            <DialogDescription className="text-xs mt-1">
              Selecciona el usuario que será dueño de <span className="font-semibold text-foreground">"{assignOwnerRestName}"</span>.
              Se le asignará automáticamente el rol de restaurante.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            {/* Buscador de usuarios */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar por usuario o correo..."
                value={ownerSearch}
                onChange={(e) => setOwnerSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-xl bg-background focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Lista de usuarios filtrados */}
            <div className="max-h-64 overflow-y-auto space-y-1 rounded-xl border border-border/60 p-1">
              {users && users
                .filter((u) =>
                  ownerSearch === "" ||
                  u.username.toLowerCase().includes(ownerSearch.toLowerCase()) ||
                  (u.email || "").toLowerCase().includes(ownerSearch.toLowerCase())
                )
                .map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => setSelectedOwnerId(u.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${selectedOwnerId === u.id
                      ? "bg-blue-500/10 border border-blue-500/30"
                      : "hover:bg-muted/60 border border-transparent"
                      }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs uppercase border border-primary/20 shrink-0">
                      {(u.nombre || u.username).slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{u.nombre || u.username}</p>
                      <p className="text-xs text-muted-foreground truncate">{u.email || `@${u.username}`}</p>
                    </div>
                    {selectedOwnerId === u.id && (
                      <Check className="w-4 h-4 text-blue-500 shrink-0" />
                    )}
                  </button>
                ))}
              {users && users.filter((u) =>
                ownerSearch === "" ||
                u.username.toLowerCase().includes(ownerSearch.toLowerCase()) ||
                (u.email || "").toLowerCase().includes(ownerSearch.toLowerCase())
              ).length === 0 && (
                  <p className="text-center text-xs text-muted-foreground py-6">No se encontraron usuarios</p>
                )}
            </div>

            <Button
              className="w-full"
              disabled={!selectedOwnerId || assignOwnerMutation.isPending}
              onClick={() => {
                if (assignOwnerRestId && selectedOwnerId) {
                  assignOwnerMutation.mutate({ restId: assignOwnerRestId, duenoId: selectedOwnerId });
                }
              }}
            >
              {assignOwnerMutation.isPending ? "Asignando..." : "Confirmar asignación"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog for destructive operations */}
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        onConfirm={handleConfirmAction}
        title={
          confirmAction?.type.includes("delete")
            ? "¡Acción Destructiva Detectada!"
            : "Confirmar Suspensión"
        }
        description={
          confirmAction?.type.includes("delete")
            ? `¿Estás seguro de que deseas eliminar lógicamente a "${confirmAction?.name}"? Esta acción deshabilitará su acceso al sistema y no se mostrará de forma activa.`
            : `¿Estás seguro de que deseas suspender a "${confirmAction?.name}"? Sus accesos o visibilidad quedarán temporalmente bloqueados.`
        }
        confirmText={confirmAction?.type.includes("delete") ? "Eliminar" : "Suspender"}
        variant={confirmAction?.type.includes("delete") ? "destructive" : "default"}
      />
    </div>
  );
};

export default AdminPage;