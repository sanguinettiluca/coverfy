import {useState} from "react";
import {useForm} from "react-hook-form";
import {z} from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { login as loginService } from "@/services/auth.service";

const schema = z.object({
    email: z.string().email("Email inválido"),
    password: z.string().min(6, "Mínimo 6 caracteres")
});

// esto es para que react-hook-form sepa el tipo de los datos del formulario, basado en el schema de zod
type FormData = z.infer<typeof schema>;

export function LoginPage() {
    const {login} = useAuth();
    const [loading, setLoading] = useState(false);
    const {register, handleSubmit, formState: {errors} } = useForm<FormData> ({
        resolver: zodResolver(schema)
    });
    
    const onSubmit = async (data: FormData) => {
        setLoading(true);
        try{
            const res = await loginService(data.email, data.password);
            login(res.user, res.accessToken);
            // App.tsx detecta el user y muestra la vista correcta automáticamente
        }catch (error: any) {
            toast.error(error?.response?.data?.message ?? "Error al iniciar sesión");
        }finally {
            setLoading(false);
        }
    };

    return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6 p-8 rounded-xl border border-border shadow-sm bg-card">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Coverfy</h1>
          <p className="text-sm text-muted-foreground">Ingresá a tu cuenta</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="tu@email.com" {...register("email")} />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>

          <div className="space-y-1">
            <Label htmlFor="password">Contraseña</Label>
            <Input id="password" type="password" placeholder="*******" {...register("password")} />
            {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
          </div>

          <Button type="submit" className="w-full bg-primary text-primary-foreground hover:opacity-90" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Ingresar
          </Button>
        </form>
      </div>
    </div>
  );
}