import { useState } from "react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { ClientesList } from "./ClientesList";
import { ClienteDetalle } from "./ClienteDetalle";

type Vista = {tipo: "lista" } | { tipo: "detalle"; clienteId: string};

export function BrokerApp() {
    const { logout } = useAuth();
    // Estado para controlar qué vista mostrar (default: lista de clientes)
    const [vista, setVista] = useState<Vista>({ tipo: "lista" });

    return (
    <div className="min-h-screen bg-background">
        <header className="h-14 border-b border-border bg-primary px-6 flex items-center justify-between">
            <h1 className="text-lg font-bold text-primary-foreground">Coverfy</h1>
            <Button variant="ghost" size="sm" onClick={logout} className="gap-2 text-primary-foreground hover:bg-primary-foreground/10">
                <LogOut className="h-4 w-4" /> Salir
            </Button>
        </header>

        <main className="max-w-4xl mx-auto mt-8 px-4">
            {vista.tipo === "lista" ? (
            <ClientesList onVerCliente={(clienteId) => setVista({ tipo: "detalle", clienteId })} />
            ) : (
            <ClienteDetalle clienteId={vista.clienteId} onVolver={() => setVista({ tipo: "lista" })} />
            )}
        </main>
    </div>
    );

}