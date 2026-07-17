import { useEffect, useState } from "react";
import api from "../../data/api"; // ajustá el path real

type EstadoPoliza = "ACTIVA" | "VENCIDA" | "CANCELADA" | "SUSPENDIDA";

type Poliza = {
    id: string;
    estado?: EstadoPoliza | null;
};

const PolicyStatusCounters = () => {
    const [conteo, setConteo] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get("/polizas", { params: { porPagina: 1000, pagina: 1 } })
            .then((response) => {
                const polizas: Poliza[] = response.data.polizas ?? [];
                const nuevoConteo: Record<string, number> = {};
                polizas.forEach((p) => {
                    const estado = p.estado ?? "SIN_ESTADO";
                    nuevoConteo[estado] = (nuevoConteo[estado] ?? 0) + 1;
                });
                setConteo(nuevoConteo);
            })
            .catch(() => setConteo({}))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="dashboard-stats-grid">
                <div className="dashboard-stat-card">
                    <span className="dashboard-widget-loading">Cargando...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-stats-grid">
            <div className="dashboard-stat-card">
                <span className="dashboard-stat-value dashboard-stat-value--activa">
                    {conteo.ACTIVA ?? 0}
                </span>
                <span className="dashboard-stat-label">Activas</span>
            </div>
            <div className="dashboard-stat-card">
                <span className="dashboard-stat-value dashboard-stat-value--vencida">
                    {conteo.VENCIDA ?? 0}
                </span>
                <span className="dashboard-stat-label">Vencidas</span>
            </div>
            <div className="dashboard-stat-card">
                <span className="dashboard-stat-value dashboard-stat-value--pendiente">
                    {conteo.CANCELADA ?? 0}
                </span>
                <span className="dashboard-stat-label">Canceladas</span>
            </div>
            <div className="dashboard-stat-card">
                <span className="dashboard-stat-value dashboard-stat-value--suspendida">
                    {conteo.SUSPENDIDA ?? 0}
                </span>
                <span className="dashboard-stat-label">Suspendidas</span>
            </div>
        </div>
    );
};

export default PolicyStatusCounters;