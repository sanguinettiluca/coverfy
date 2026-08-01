import { useEffect, useState } from "react";
import api from "../../data/api";

type PolicyStatus = "ACTIVE" | "EXPIRED" | "CANCELLED" | "SUSPENDED";

type Policy = {
    id: string;
    status?: PolicyStatus | null;
};

const PolicyStatusCounters = () => {
    const [count, setCount] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get("/polizas", { params: { perPage: 999999, page: 1 } })
            .then((response) => {
                const policies: Policy[] = response.data.policies ?? [];
                const newCount: Record<string, number> = {};
                policies.forEach((p) => {
                    const status = p.status ?? "SIN_ESTADO";
                    newCount[status] = (newCount[status] ?? 0) + 1;
                });
                setCount(newCount);
            })
            .catch(() => setCount({}))
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
                    {count.ACTIVE ?? 0}
                </span>
                <span className="dashboard-stat-label">Activas</span>
            </div>
            <div className="dashboard-stat-card">
                <span className="dashboard-stat-value dashboard-stat-value--vencida">
                    {count.EXPIRED ?? 0}
                </span>
                <span className="dashboard-stat-label">Vencidas</span>
            </div>
            <div className="dashboard-stat-card">
                <span className="dashboard-stat-value dashboard-stat-value--pendiente">
                    {count.CANCELLED ?? 0}
                </span>
                <span className="dashboard-stat-label">Canceladas</span>
            </div>
            <div className="dashboard-stat-card">
                <span className="dashboard-stat-value dashboard-stat-value--suspendida">
                    {count.SUSPENDED ?? 0}
                </span>
                <span className="dashboard-stat-label">Suspendidas</span>
            </div>
        </div>
    );
};

export default PolicyStatusCounters;