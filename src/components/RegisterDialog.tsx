import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { registerUser, registerRestaurant, loginUser } from "@/services/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Store, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const API_URL = "http://127.0.0.1:8000/api";

interface RegisterDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccessLogin: () => void;
}

type Role = "user" | "restaurant";
type Step = "cuenta" | "restaurante" | "listo";

const RegisterDialog = ({ open, onOpenChange, onSuccessLogin }: RegisterDialogProps) => {
    const [role, setRole] = useState<Role>("user");
    const [step, setStep] = useState<Step>("cuenta");

    // Datos cuenta
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    // Datos restaurante
    const [restNombre, setRestNombre] = useState("");
    const [restTelefono, setRestTelefono] = useState("");
    const [restDescripcion, setRestDescripcion] = useState("");
    const [restDireccion, setRestDireccion] = useState("");
    const [savingRest, setSavingRest] = useState(false);

    const resetForm = () => {
        setRole("user");
        setStep("cuenta");
        setUsername(""); setEmail(""); setPassword("");
        setRestNombre(""); setRestTelefono(""); setRestDescripcion(""); setRestDireccion("");
    };

    const handleClose = (open: boolean) => {
        if (!open) resetForm();
        onOpenChange(open);
    };

    // Paso 1: Crear cuenta
    const handleSubmitCuenta = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (role === "restaurant") {
                await registerRestaurant(username, email, password);
                // Auto-login para poder crear el restaurante
                await loginUser(username, password);
                setStep("restaurante");
            } else {
                await registerUser(username, email, password);
                toast.success("¡Cuenta creada! Ahora inicia sesión.");
                handleClose(false);
                onSuccessLogin();
            }
        } catch (error: any) {
            const firstError = Object.values(error)[0];
            toast.error(Array.isArray(firstError) ? firstError[0] : "Error al registrarse");
        } finally {
            setLoading(false);
        }
    };

    // Paso 2: Crear restaurante
    const handleSubmitRestaurante = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!restNombre.trim()) {
            toast.error("El nombre del restaurante es obligatorio");
            return;
        }
        setSavingRest(true);
        try {
            const token = localStorage.getItem("token");
            const formData = new FormData();
            formData.append("nombre", restNombre);
            formData.append("telefono", restTelefono);
            formData.append("descripcion", restDescripcion);
            formData.append("direccion", restDireccion);

            const res = await fetch(`${API_URL}/restaurantes/`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });

            if (!res.ok) throw new Error("Error creando restaurante");
            setStep("listo");
        } catch {
            toast.error("Error al crear el restaurante. Puedes completarlo desde tu dashboard.");
            setStep("listo");
        } finally {
            setSavingRest(false);
        }
    };

    const handleSaltarRestaurante = () => setStep("listo");

    const handleFinish = () => {
        toast.success("¡Bienvenido a FoodMap!");
        handleClose(false);
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">

                {/* PASO 1: Crear cuenta */}
                {step === "cuenta" && (
                    <>
                        <DialogHeader>
                            <DialogTitle className="text-2xl text-center">Crear cuenta</DialogTitle>
                            <DialogDescription className="text-center">
                                Únete a FoodMap y descubre restaurantes cerca de ti
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleSubmitCuenta} className="flex flex-col gap-4 mt-2">
                            <div className="space-y-2">
                                <Label>Selecciona tu tipo de cuenta:</Label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setRole("user")}
                                        className={`relative flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all
                                            ${role === "user"
                                                ? "border-primary bg-primary/10 text-primary"
                                                : "border-border bg-muted/30 text-muted-foreground hover:border-primary/50"
                                            }`}
                                    >
                                        {role === "user" && <span className="absolute top-2 right-2 text-primary text-xs">✓</span>}
                                        <User className="w-7 h-7" />
                                        <span className="text-sm font-medium">Como Usuario</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setRole("restaurant")}
                                        className={`relative flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all
                                            ${role === "restaurant"
                                                ? "border-primary bg-primary/10 text-primary"
                                                : "border-border bg-muted/30 text-muted-foreground hover:border-primary/50"
                                            }`}
                                    >
                                        {role === "restaurant" && <span className="absolute top-2 right-2 text-primary text-xs">✓</span>}
                                        <Store className="w-7 h-7" />
                                        <span className="text-sm font-medium">Como Restaurante</span>
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="reg-username">Usuario</Label>
                                <Input id="reg-username" type="text" placeholder="Elige un nombre de usuario"
                                    value={username} onChange={(e) => setUsername(e.target.value)} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="reg-email">Correo electrónico</Label>
                                <Input id="reg-email" type="email" placeholder="tu@correo.com"
                                    value={email} onChange={(e) => setEmail(e.target.value)} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="reg-password">Contraseña</Label>
                                <Input id="reg-password" type="password" placeholder="Mínimo 8 caracteres"
                                    value={password} onChange={(e) => setPassword(e.target.value)} required />
                            </div>

                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? "Creando cuenta..." : role === "restaurant" ? "Continuar →" : "Crear cuenta"}
                            </Button>

                            <p className="text-center text-sm text-muted-foreground">
                                ¿Ya tienes cuenta?{" "}
                                <button type="button" className="text-primary underline"
                                    onClick={() => { handleClose(false); onSuccessLogin(); }}>
                                    Inicia sesión
                                </button>
                            </p>
                        </form>
                    </>
                )}

                {/* PASO 2: Datos del restaurante */}
                {step === "restaurante" && (
                    <>
                        <DialogHeader>
                            <div className="flex items-center gap-2 mb-1">
                                <button type="button" onClick={() => setStep("cuenta")}
                                    className="text-muted-foreground hover:text-foreground">
                                    <ArrowLeft className="w-4 h-4" />
                                </button>
                                <div className="flex gap-1.5 ml-auto">
                                    <span className="w-2 h-2 rounded-full bg-primary" />
                                    <span className="w-2 h-2 rounded-full bg-primary" />
                                    <span className="w-2 h-2 rounded-full bg-border" />
                                </div>
                            </div>
                            <DialogTitle className="text-2xl text-center flex items-center justify-center gap-2">
                                <Store className="w-6 h-6 text-primary" />
                                Tu restaurante
                            </DialogTitle>
                            <DialogDescription className="text-center">
                                Cuéntanos sobre tu local. Puedes completar esto después desde tu dashboard.
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleSubmitRestaurante} className="flex flex-col gap-4 mt-2">
                            <div className="space-y-2">
                                <Label htmlFor="rest-nombre">Nombre del restaurante <span className="text-primary">*</span></Label>
                                <Input id="rest-nombre" type="text" placeholder="Ej: La Fonda Paisa"
                                    value={restNombre} onChange={(e) => setRestNombre(e.target.value)} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="rest-telefono">Teléfono</Label>
                                <Input id="rest-telefono" type="text" placeholder="Ej: 3201234567"
                                    value={restTelefono} onChange={(e) => setRestTelefono(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="rest-descripcion">Descripción</Label>
                                <textarea id="rest-descripcion" placeholder="Describe brevemente tu restaurante..."
                                    value={restDescripcion} onChange={(e) => setRestDescripcion(e.target.value)}
                                    className="w-full p-2 border border-border rounded-lg bg-background text-sm min-h-[72px] focus:outline-none focus:ring-1 focus:ring-primary resize-none" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="rest-direccion">Dirección</Label>
                                <Input id="rest-direccion" type="text" placeholder="Ej: Calle 10 # 5-20, Buenaventura"
                                    value={restDireccion} onChange={(e) => setRestDireccion(e.target.value)} />
                            </div>

                            <div className="flex gap-3">
                                <Button type="button" variant="outline" className="flex-1" onClick={handleSaltarRestaurante}>
                                    Completar después
                                </Button>
                                <Button type="submit" className="flex-1" disabled={savingRest}>
                                    {savingRest ? "Guardando..." : "Crear restaurante"}
                                </Button>
                            </div>
                        </form>
                    </>
                )}

                {/* PASO 3: Listo */}
                {step === "listo" && (
                    <div className="flex flex-col items-center gap-4 py-6 text-center">
                        <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
                            <CheckCircle2 className="w-9 h-9 text-green-500" />
                        </div>
                        <DialogTitle className="text-2xl">¡Todo listo!</DialogTitle>
                        <DialogDescription className="max-w-xs">
                            Tu cuenta fue creada exitosamente. Puedes completar o editar los datos de tu restaurante
                            en cualquier momento desde tu <span className="font-semibold text-foreground">Dashboard</span>.
                        </DialogDescription>
                        <Button className="w-full mt-2" onClick={handleFinish}>
                            Ir al inicio
                        </Button>
                    </div>
                )}

            </DialogContent>
        </Dialog>
    );
};

export default RegisterDialog;