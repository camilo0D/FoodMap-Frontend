import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { registerUser } from "@/services/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useState } from "react";
import { toast } from "sonner";

interface RegisterDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccessLogin: () => void;
}

const RegisterDialog = ({ open, onOpenChange, onSuccessLogin }: RegisterDialogProps) => {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await registerUser(username, email, password);
            toast.success("¡Cuenta creada! Ahora inicia sesión.");
            onOpenChange(false);
            onSuccessLogin();
        } catch (error: any) {
            const firstError = Object.values(error)[0];
            toast.error(Array.isArray(firstError) ? firstError[0] : "Error al registrarse");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">

                <DialogHeader>
                    <DialogTitle className="text-2xl text-center">Crear cuenta</DialogTitle>
                    <DialogDescription className="text-center">
                        Únete a FoodMap y descubre restaurantes cerca de ti
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
                    <div className="space-y-2">
                        <Label htmlFor="reg-username">Usuario</Label>
                        <Input
                            id="reg-username"
                            type="text"
                            placeholder="Elige un nombre de usuario"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="reg-email">Correo electrónico</Label>
                        <Input
                            id="reg-email"
                            type="email"
                            placeholder="tu@correo.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="reg-password">Contraseña</Label>
                        <Input
                            id="reg-password"
                            type="password"
                            placeholder="Mínimo 8 caracteres"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "Creando cuenta..." : "Crear cuenta"}
                    </Button>

                    <p className="text-center text-sm text-muted-foreground">
                        ¿Ya tienes cuenta?{" "}
                        <button
                            type="button"
                            className="text-primary underline"
                            onClick={() => {
                                onOpenChange(false);
                                onSuccessLogin();
                            }}
                        >
                            Inicia sesión
                        </button>
                    </p>
                </form>

            </DialogContent>
        </Dialog>
    );
};

export default RegisterDialog;