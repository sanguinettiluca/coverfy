import { useState } from "react";
import { LogOut, Users, BarChart3, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { ClientsList } from "./ClientsList";
import { ClientDetail } from "./ClientDetail";
import { ReportsPage } from "./ReportsPage";
import { CommissionsPage } from "./CommissionsPage";

type View = { type: "list" } | { type: "detail"; clientId: string } | { type: "reports" } | { type: "commissions" };

export function BrokerApp() {
  const { logout, user } = useAuth();
  const [view, setView] = useState<View>({ type: "list" });

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside className="w-56 bg-primary flex flex-col shrink-0">
        <div className="px-5 py-5 border-b border-primary-foreground/10">
          <h1 className="text-xl font-bold text-primary-foreground tracking-tight">Coverfy</h1>
          <p className="text-xs text-primary-foreground/50 mt-0.5">Panel de gestión</p>
        </div>

        <nav className="flex-1 px-3 py-4">
          <button
            onClick={() => setView({ type: "list" })}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
              view.type === "list"
                ? "bg-secondary text-secondary-foreground"
                : "text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground"
            )}
          >
            <Users className="h-4 w-4" />
            Clientes
          </button>

          <button
            onClick={() => setView({ type: "reports" })}
            className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
            view.type === "reports"
            ? "bg-secondary text-secondary-foreground"
            : "text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground"
            )}
          >
            <BarChart3 className="h-4 w-4" />
              Reportes
          </button>

          <button
            onClick={() => setView({ type: "commissions" })}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
              view.type === "commissions"
                ? "bg-secondary text-secondary-foreground"
                : "text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground"
            )}
          >
            <DollarSign className="h-4 w-4" />
            Comisiones
          </button>
        </nav>

        <div className="px-3 py-4 border-t border-primary-foreground/10 space-y-2">
          <p className="text-xs text-primary-foreground/50 truncate px-3">{user?.email}</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="w-full justify-start gap-3 text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground"
          >
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </Button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-4xl mx-auto">
          {view.type === "reports" ? (
            <ReportsPage />
          ) : view.type === "commissions" ? (
            <CommissionsPage />
          ) : view.type === "list" ? (
            <ClientsList onViewClient={(clientId) => setView({ type: "detail", clientId })} />
          ) : (
            <ClientDetail clientId={view.clientId} onBack={() => setView({ type: "list" })} />
          )}
        </div>
      </main>
    </div>
  );
}
