import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { loginUser } from "@/services/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenRegister?: () => void;
}

const LoginDialog = ({ open, onOpenChange, onOpenRegister }: LoginDialogProps) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await loginUser(username, password);
      toast.success("Inicio de sesión correcto");
      onOpenChange(false);
      navigate("/mapa");
    } catch (error) {
      console.error(error);
      toast.error("Usuario o contraseña incorrectos");
    } finally {
      setLoading(false);
    }
  };

  const handleSocial = (provider: string) => {
    toast.info(`Inicio con ${provider} próximamente`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">

        <DialogHeader>
          <DialogTitle className="text-2xl text-center">Iniciar sesión</DialogTitle>
          <DialogDescription className="text-center">
            Accede a tu cuenta de FoodMap
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 mt-2">
          <Button variant="outline" className="w-full" onClick={() => handleSocial("Google")}>
            Continuar con Google
          </Button>
          <Button variant="outline" className="w-full" onClick={() => handleSocial("Facebook")}>
            Continuar con Facebook
          </Button>
        </div>

        <div className="flex items-center gap-3 my-2">
          <Separator className="flex-1" />
          <span>o</span>
          <Separator className="flex-1" />
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="space-y-2">
            <Label htmlFor="username">Usuario</Label>
            <Input
              id="username"
              type="text"
              placeholder="Tu usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Iniciando sesión..." : "Iniciar sesión"}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            ¿No tienes cuenta?{" "}
            <button
              type="button"
              className="text-primary underline"
              onClick={() => {
                onOpenChange(false);
                onOpenRegister?.();
              }}
            >
              Regístrate
            </button>
          </p>
        </form>

      </DialogContent>
    </Dialog>
  );
};

export default LoginDialog;