import {LogOut} from "lucide-react";
import {useNavigate} from "react-router-dom";
import {toast} from "sonner";
import {Button} from "@/components/ui/button";
import {useAuth} from "@/context/AuthContext";

export function Header(){
    const {logout, user} = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        toast.success("Sesión cerrada");
        navigate("/login", { replace: true });
    };

    const roleLabel: Record<string, string> = {
        ADMIN: "Administrador",
        BROKER: "Corredor",
        SUB_BROKER: "Sub-corredor"
    };

    return (
        <header className="h-14 border-b border-border bg-card px-6 flex items-center justify-between shrink-0">
            <p className="text-sm text-muted-foreground">
                {roleLabel[user?.role ?? ""] ?? ""}
            </p>

            <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2 text-muted-foreground hover:text-foreground">
                <LogOut className="h-4 w-4" />
                Cerrar Sesión
            </Button>
        </header>
    );
}