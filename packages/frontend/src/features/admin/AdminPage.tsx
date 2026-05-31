import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, LogOut } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { crearUsuario } from "@/services/usuarios.service";

const schema = z.object({
    nombre: z.string().min(2, "Mínimo 2 caracteres"),
    email: z.string().email("Email inválido"),
    password: z.string().min(6, "Mínimo 6 caracteres"),
    role: z.enum(["BROKER", "SUB_BROKER"])
});

type FormData = z.infer<typeof schema>;

export function AdminPage() {
    const {user, logout} = useAuth();
    const [loading, setLoading] = useState(false);
    const {register, handleSubmit, reset, formState: {errors}} = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: { role: "BROKER" }
    });

    const onSubmit = async (data: FormData) => {
        setLoading(true);
        try{
            await crearUsuario(data);
            toast.success("Usuario creado");
            reset();
        }catch (error: any) {
            toast.error(error?.response?.data?.message ?? "Error al crear usuario");
        }finally {
            setLoading(false);
        }
    };

    return (
    <div className="min-h-screen bg-background">
      <header className="h-14 border-b border-border bg-primary px-6 flex items-center justify-between">
        <h1 className="text-lg font-bold text-primary-foreground">Coverfy · Admin</h1>
        <Button variant="ghost" size="sm" onClick={logout} className="gap-2 text-primary-foreground hover:bg-primary-foreground/10">
          <LogOut className="h-4 w-4" /> Salir
        </Button>
      </header>

      <main className="max-w-md mx-auto mt-12 px-4">
        <div className="bg-card border border-border rounded-xl p-6 space-y-5">
          <div>
            <h2 className="text-lg font-semibold">Crear usuario</h2>
            <p className="text-sm text-muted-foreground">Conectado como {user?.email}</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="nombre">Nombre</Label>
              <Input id="nombre" {...register("nombre")} />
              {errors.nombre && <p className="text-xs text-destructive">{errors.nombre.message}</p>}
            </div>

            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register("email")} />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-1">
              <Label htmlFor="password">Contraseña</Label>
              <Input id="password" type="password" {...register("password")} />
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>

            <div className="space-y-1">
              <Label htmlFor="role">Rol</Label>
              <select
                id="role"
                {...register("role")}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="BROKER">Broker</option>
                <option value="SUB_BROKER">Sub Broker</option>
              </select>
            </div>

            <Button type="submit" className="w-full bg-primary text-primary-foreground hover:opacity-90" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Crear usuario
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}