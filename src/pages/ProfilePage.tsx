import React, { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
  ArrowLeft,
  User,
  Camera,
  Save,
  Star,
  Trash2,
  MessageSquare,
  CalendarDays,
  MapPin,
  Loader2,
  Pencil,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import { getUsername } from "@/services/auth";
import {
  useUserProfile,
  useUpdateProfile,
  useUserReviews,
  useDeleteReview,
} from "@/hooks/useProfile";

interface ProfileFormValues {
  nombre: string;
  bio: string;
}

const API_BASE = "http://127.0.0.1:8000";

const ProfilePage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null);

  // Queries & Mutations
  const { data: profile, isLoading: profileLoading, isError: profileError } = useUserProfile();
  const updateProfile = useUpdateProfile();
  const { data: reviews, isLoading: reviewsLoading } = useUserReviews();
  const deleteReview = useDeleteReview();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileFormValues>();

  // Sync form with fetched profile data
  useEffect(() => {
    if (profile) {
      reset({
        nombre: profile.nombre || "",
        bio: profile.bio || "",
      });
    }
  }, [profile, reset]);

  // Resolved avatar URL
  const resolvedAvatar = avatarPreview
    || (profile?.avatar
      ? (profile.avatar.startsWith("http") ? profile.avatar : `${API_BASE}${profile.avatar}`)
      : null
    );

  const initials = (profile?.nombre || profile?.username || getUsername() || "U")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // ─── Handlers ────────────────────────────────────────────

  const onAvatarClick = () => fileInputRef.current?.click();

  const onAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type and size
    if (!file.type.startsWith("image/")) return;
    if (file.size > 5 * 1024 * 1024) return; // 5MB max

    setAvatarFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const onProfileSubmit = (data: ProfileFormValues) => {
    const formData = new FormData();
    formData.append("nombre", data.nombre);
    formData.append("bio", data.bio);
    if (avatarFile) {
      formData.append("avatar", avatarFile);
    }
    updateProfile.mutate(formData, {
      onSuccess: (updatedProfile) => {
        setAvatarFile(null);
        setAvatarPreview(null);
        // Reinicializar el formulario con los datos actualizados
        reset({
          nombre: updatedProfile.nombre || "",
          bio: updatedProfile.bio || "",
        });
      },
    });
  };

  const handleDeleteReview = (reviewId: string) => {
    setReviewToDelete(reviewId);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteReview = () => {
    if (reviewToDelete) {
      deleteReview.mutate(reviewToDelete);
    }
    setDeleteDialogOpen(false);
    setReviewToDelete(null);
  };

  // ─── Loading State ───────────────────────────────────────

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 bg-card/85 backdrop-blur-md border-b border-border/60">
          <div className="container py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-muted animate-pulse rounded-full" />
              <div className="w-24 h-6 bg-muted animate-pulse rounded" />
            </div>
            <div className="w-10 h-10 bg-muted animate-pulse rounded-full" />
          </div>
        </header>
        <div className="container max-w-3xl py-10 px-4 space-y-8">
          {/* Avatar skeleton */}
          <div className="flex flex-col items-center gap-4">
            <div className="w-28 h-28 rounded-full bg-muted animate-pulse" />
            <div className="w-40 h-6 bg-muted animate-pulse rounded" />
            <div className="w-24 h-4 bg-muted animate-pulse rounded" />
          </div>
          {/* Tabs skeleton */}
          <div className="w-full h-10 bg-muted animate-pulse rounded-lg" />
          {/* Form skeleton */}
          <div className="space-y-4">
            <div className="w-full h-12 bg-muted animate-pulse rounded-xl" />
            <div className="w-full h-24 bg-muted animate-pulse rounded-xl" />
            <div className="w-32 h-10 bg-muted animate-pulse rounded-lg ml-auto" />
          </div>
        </div>
      </div>
    );
  }

  // ─── Error State ─────────────────────────────────────────

  if (profileError || !profile) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="sticky top-0 z-50 bg-card/85 backdrop-blur-md border-b border-border/60">
          <div className="container py-4 flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <span className="text-xl font-bold text-primary">FoodMap</span>
          </div>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
          <User className="w-16 h-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Error al cargar el perfil</h2>
          <p className="text-muted-foreground mb-6">
            No pudimos obtener la información de tu perfil. Intenta de nuevo.
          </p>
          <Button onClick={() => window.location.reload()}>Reintentar</Button>
        </div>
      </div>
    );
  }

  // ─── Main Render ─────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/85 backdrop-blur-md border-b border-border/60 transition-colors">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              id="profile-back-btn"
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
              className="text-muted-foreground hover:text-primary transition-colors rounded-full"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <Link to="/" className="text-xl font-bold text-primary hover:opacity-80 transition-opacity">
              FoodMap
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <ThemeSwitcher />
          </div>
        </div>
      </header>

      <main className="container max-w-3xl py-8 px-4 space-y-8 animate-fade-in">
        {/* Breadcrumb */}
        <div className="flex items-center text-xs text-muted-foreground gap-2">
          <Link to="/" className="hover:text-primary transition-colors">Inicio</Link>
          <span>/</span>
          <Link to="/mapa" className="hover:text-primary transition-colors">Mapa</Link>
          <span>/</span>
          <span className="text-foreground font-medium">Mi Perfil</span>
        </div>

        {/* Hero: Avatar + User Info */}
        <section className="relative overflow-hidden rounded-2xl bg-card border border-border/60 shadow-sm">
          {/* Decorative gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-primary/4 pointer-events-none" />
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-primary/5 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-primary/5 blur-xl pointer-events-none" />

          <div className="relative px-6 py-8 sm:px-10 sm:py-10 flex flex-col sm:flex-row items-center gap-6">
            {/* Avatar with upload overlay */}
            <div className="relative group">
              <Avatar className="w-28 h-28 border-4 border-background shadow-lg ring-2 ring-primary/20">
                {resolvedAvatar ? (
                  <AvatarImage src={resolvedAvatar} alt={profile.nombre || profile.username} />
                ) : null}
                <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>

              {/* Camera overlay */}
              <button
                type="button"
                onClick={onAvatarClick}
                className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/40 flex items-center justify-center transition-all duration-300 cursor-pointer"
                aria-label="Cambiar avatar"
              >
                <Camera className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onAvatarChange}
              />

              {/* Online indicator dot */}
              <span className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-emerald-500 border-[3px] border-card shadow-sm" />
            </div>

            {/* User details */}
            <div className="text-center sm:text-left flex-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                {profile.nombre || profile.username}
              </h1>
              <p className="text-muted-foreground text-sm mt-1">@{profile.username}</p>

              {profile.bio && (
                <p className="text-foreground/75 text-sm mt-3 max-w-md leading-relaxed">
                  {profile.bio}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-2 mt-4 justify-center sm:justify-start">
                {profile.roles?.map((role) => (
                  <span
                    key={role}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20"
                  >
                    <ShieldCheck className="w-3 h-3" />
                    {role}
                  </span>
                ))}

                {profile.created_at && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-muted/60 text-muted-foreground">
                    <CalendarDays className="w-3 h-3" />
                    Miembro desde{" "}
                    {new Date(profile.created_at).toLocaleDateString("es-ES", {
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Tabs: Mi Perfil | Mis Reseñas */}
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="w-full grid grid-cols-2 h-12 rounded-xl bg-muted/50 border border-border/40 p-1">
            <TabsTrigger
              id="tab-profile"
              value="profile"
              className="rounded-lg text-sm font-semibold data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=active]:text-foreground transition-all"
            >
              <Pencil className="w-4 h-4 mr-2" />
              Mi Perfil
            </TabsTrigger>
            <TabsTrigger
              id="tab-reviews"
              value="reviews"
              className="rounded-lg text-sm font-semibold data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=active]:text-foreground transition-all"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Mis Reseñas
              {reviews && reviews.length > 0 && (
                <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold rounded-full bg-primary/15 text-primary">
                  {reviews.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* ─── Tab 1: Edit Profile ──────────────────────── */}
          <TabsContent value="profile">
            <form
              onSubmit={handleSubmit(onProfileSubmit)}
              className="bg-card rounded-2xl border border-border/60 shadow-sm p-6 sm:p-8 space-y-6 transition-colors"
            >
              <div className="flex items-center justify-between border-b border-border/40 pb-4">
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  Editar información
                </h2>
                <span className="text-xs text-muted-foreground">
                  Los campos marcados con * son opcionales
                </span>
              </div>

              {/* Nombre */}
              <div className="space-y-2">
                <label
                  htmlFor="profile-nombre"
                  className="block text-sm font-semibold text-foreground"
                >
                  Nombre completo
                </label>
                <input
                  id="profile-nombre"
                  type="text"
                  {...register("nombre", {
                    required: "El nombre es obligatorio",
                    minLength: { value: 2, message: "Mínimo 2 caracteres" },
                    maxLength: { value: 100, message: "Máximo 100 caracteres" },
                  })}
                  className="w-full px-4 py-3 bg-background border border-border/80 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                  placeholder="Tu nombre completo"
                />
                {errors.nombre && (
                  <p className="text-xs text-destructive font-medium mt-1">
                    {errors.nombre.message}
                  </p>
                )}
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <label
                  htmlFor="profile-bio"
                  className="block text-sm font-semibold text-foreground"
                >
                  Biografía *
                </label>
                <textarea
                  id="profile-bio"
                  {...register("bio", {
                    maxLength: { value: 300, message: "Máximo 300 caracteres" },
                  })}
                  className="w-full min-h-[120px] px-4 py-3 bg-background border border-border/80 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none resize-y"
                  placeholder="Cuéntanos un poco sobre ti... ¿Qué tipo de comida te gusta?"
                />
                {errors.bio && (
                  <p className="text-xs text-destructive font-medium mt-1">
                    {errors.bio.message}
                  </p>
                )}
              </div>

              {/* Avatar Upload Section */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-foreground">
                  Foto de perfil *
                </label>
                <div className="flex items-center gap-4">
                  <Avatar className="w-16 h-16 border-2 border-border shadow-sm">
                    {resolvedAvatar ? (
                      <AvatarImage src={resolvedAvatar} alt="Preview" />
                    ) : null}
                    <AvatarFallback className="text-lg font-bold bg-primary/10 text-primary">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={onAvatarClick}
                      className="text-sm font-medium"
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      {avatarFile ? "Cambiar imagen" : "Subir imagen"}
                    </Button>
                    <p className="text-[11px] text-muted-foreground mt-1.5">
                      JPG, PNG o GIF. Máximo 5 MB.
                    </p>
                    {avatarFile && (
                      <p className="text-[11px] text-primary font-medium mt-0.5">
                        ✓ {avatarFile.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit */}
              <div className="flex justify-end pt-4 border-t border-border/40">
                <Button
                  id="profile-save-btn"
                  type="submit"
                  disabled={updateProfile.isPending || (!isDirty && !avatarFile)}
                  className="flex items-center gap-2 font-bold px-6 py-2.5 min-w-[160px]"
                >
                  {updateProfile.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {updateProfile.isPending ? "Guardando..." : "Guardar cambios"}
                </Button>
              </div>
            </form>
          </TabsContent>

          {/* ─── Tab 2: Reviews History ───────────────────── */}
          <TabsContent value="reviews">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between px-1">
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  Historial de reseñas
                </h2>
                {reviews && reviews.length > 0 && (
                  <span className="text-xs text-muted-foreground font-medium">
                    {reviews.length} {reviews.length === 1 ? "reseña" : "reseñas"} publicadas
                  </span>
                )}
              </div>

              {/* Loading state */}
              {reviewsLoading && (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="bg-card border border-border/60 rounded-2xl p-5 space-y-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-muted animate-pulse" />
                        <div className="flex-1 space-y-2">
                          <div className="w-40 h-4 bg-muted animate-pulse rounded" />
                          <div className="w-24 h-3 bg-muted animate-pulse rounded" />
                        </div>
                        <div className="w-20 h-4 bg-muted animate-pulse rounded" />
                      </div>
                      <div className="w-full h-12 bg-muted animate-pulse rounded-lg" />
                    </div>
                  ))}
                </div>
              )}

              {/* Reviews list */}
              {!reviewsLoading && reviews && reviews.length > 0 && (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div
                      key={review.id}
                      className="bg-card border border-border/60 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 group"
                    >
                      {/* Top row: Restaurant info + Rating */}
                      <div className="flex items-start justify-between gap-4">
                        <Link
                          to={`/restaurante/${review.restaurante.id}`}
                          className="flex items-center gap-3 min-w-0 flex-1 group/link"
                        >
                          {/* Restaurant thumbnail */}
                          <div className="w-12 h-12 rounded-xl bg-muted overflow-hidden shrink-0 border border-border/40 shadow-sm group-hover/link:ring-2 group-hover/link:ring-primary/30 transition-all">
                            {review.restaurante.imagen ? (
                              <img
                                src={
                                  review.restaurante.imagen.startsWith("http")
                                    ? review.restaurante.imagen
                                    : `${API_BASE}${review.restaurante.imagen}`
                                }
                                alt={review.restaurante.nombre}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                <MapPin className="w-5 h-5" />
                              </div>
                            )}
                          </div>

                          <div className="min-w-0">
                            <h3 className="text-sm font-bold text-foreground truncate group-hover/link:text-primary transition-colors flex items-center gap-1.5">
                              {review.restaurante.nombre}
                              <ExternalLink className="w-3 h-3 opacity-0 group-hover/link:opacity-100 transition-opacity shrink-0" />
                            </h3>
                            <span className="text-[11px] text-muted-foreground">
                              {new Date(review.created_at).toLocaleDateString("es-ES", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                        </Link>

                        {/* Rating stars */}
                        <div className="flex items-center gap-0.5 shrink-0">
                          {Array.from({ length: 5 }).map((_, idx) => (
                            <Star
                              key={idx}
                              className={`w-3.5 h-3.5 ${idx < review.rating
                                  ? "fill-amber-500 text-amber-500"
                                  : "text-muted-foreground/30"
                                }`}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Comment text */}
                      <p className="mt-3 text-foreground/85 text-sm leading-relaxed pl-1">
                        {review.comment}
                      </p>

                      {/* Actions row */}
                      <div className="mt-4 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <Button
                          id={`delete-review-${review.id}`}
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteReview(review.id)}
                          disabled={deleteReview.isPending}
                          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 text-xs font-medium gap-1.5 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Empty state */}
              {!reviewsLoading && (!reviews || reviews.length === 0) && (
                <div className="text-center py-16 bg-card border border-border/40 rounded-2xl">
                  <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="w-8 h-8 text-muted-foreground/40" />
                  </div>
                  <h3 className="text-base font-bold text-foreground mb-1.5">
                    Aún no tienes reseñas
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-xs mx-auto mb-6">
                    Explora restaurantes en el mapa y comparte tu opinión para verla aquí.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate("/")}
                    className="font-semibold"
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    Explorar restaurantes
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="bg-card py-10 mt-16 text-center border-t border-border/60 transition-colors">
        <p className="text-primary font-semibold">FoodMap © 2026</p>
        <p className="text-muted-foreground text-sm mt-1">
          Encuentra y califica la mejor comida a tu alrededor
        </p>
      </footer>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDeleteReview}
        title="¿Eliminar reseña?"
        description="Esta acción eliminará tu reseña permanentemente. No podrás recuperarla."
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        variant="destructive"
      />
    </div>
  );
};

export default ProfilePage;