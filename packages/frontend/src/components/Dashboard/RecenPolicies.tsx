import { useEffect, useState } from "react";
import api from "../../data/api";

type Policy = {
    id: string;
    policyNumber: string;
    referenceNumber?: string | null;
    insuranceType: string;
    status?: string | null;
    client?: { firstName: string; lastName: string } | null;
    createdAt: string;
};

const getStatusBadgeClass = (status?: string | null) => {
    switch (status) {
        case "ACTIVA":
            return "dashboard-widget-item-badge--ok";
        case "VENCIDA":
        case "CANCELADA":
            return "dashboard-widget-item-badge--urgent";
        case "SUSPENDIDA":
            return "dashboard-widget-item-badge--soon";
        default:
            return "dashboard-widget-item-badge--ok";
    }
};

const RecentPoliciesCard = () => {
    const [policies, setPolicies] = useState<Policy[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // listarPolizas ya ordena por createdAt desc por defecto, así que con
        // porPagina: 5 alcanza sin tener que ordenar de nuevo en el cliente.
        api.get("/polizas", { params: { perPage: 5, pagina: 1 } })
            .then((response) => {
                setPolicies(response.data.policies ?? []);
            })
            .catch(() => setPolicies([]))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="dashboard-widget">
            <div className="dashboard-widget-title">Últimas pólizas</div>

            {loading && <p className="dashboard-widget-loading">Cargando...</p>}

            {!loading && policies.length === 0 && (
                <p className="dashboard-widget-empty">Todavía no hay pólizas registradas</p>
            )}

            {!loading && policies.length > 0 && (
                <div className="dashboard-widget-list">
                    {policies.map((policy) => (
                        <div className="dashboard-widget-item" key={policy.id}>
                            <div className="dashboard-widget-item-main">
                                <span className="dashboard-widget-item-title">
                                    {policy.policyNumber}
                                    {policy.referenceNumber ? ` · Ref. ${policy.referenceNumber}` : ""}
                                </span>
                                <span className="dashboard-widget-item-sub">
                                    {policy.client
                                        ? `${policy.client.firstName} ${policy.client.lastName}`
                                        : policy.insuranceType}
                                </span>
                            </div>
                            {policy.status && (
                                <span className={`dashboard-widget-item-badge ${getStatusBadgeClass(policy.status)}`}>
                                    {policy.status}
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default RecentPoliciesCard;