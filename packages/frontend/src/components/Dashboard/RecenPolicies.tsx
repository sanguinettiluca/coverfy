import { useEffect, useState } from "react";
import api from "../../data/api";

type Poliza = {
    id: string;
    numeroPoliza: string;
    numeroReferencia?: string | null;
    tipoSeguro: string;
    estado?: string | null;
    cliente?: { nombres: string; apellidos: string } | null;
    createdAt: string;
};

const getEstadoBadgeClass = (estado?: string | null) => {
    switch (estado) {
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
    const [polizas, setPolizas] = useState<Poliza[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // listarPolizas ya ordena por createdAt desc por defecto, así que con
        // porPagina: 5 alcanza sin tener que ordenar de nuevo en el cliente.
        api.get("/polizas", { params: { porPagina: 5, pagina: 1 } })
            .then((response) => {
                setPolizas(response.data.polizas ?? []);
            })
            .catch(() => setPolizas([]))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="dashboard-widget">
            <div className="dashboard-widget-title">Últimas pólizas</div>

            {loading && <p className="dashboard-widget-loading">Cargando...</p>}

            {!loading && polizas.length === 0 && (
                <p className="dashboard-widget-empty">Todavía no hay pólizas registradas</p>
            )}

            {!loading && polizas.length > 0 && (
                <div className="dashboard-widget-list">
                    {polizas.map((poliza) => (
                        <div className="dashboard-widget-item" key={poliza.id}>
                            <div className="dashboard-widget-item-main">
                                <span className="dashboard-widget-item-title">
                                    {poliza.numeroPoliza}
                                    {poliza.numeroReferencia ? ` · Ref. ${poliza.numeroReferencia}` : ""}
                                </span>
                                <span className="dashboard-widget-item-sub">
                                    {poliza.cliente
                                        ? `${poliza.cliente.nombres} ${poliza.cliente.apellidos}`
                                        : poliza.tipoSeguro}
                                </span>
                            </div>
                            {poliza.estado && (
                                <span className={`dashboard-widget-item-badge ${getEstadoBadgeClass(poliza.estado)}`}>
                                    {poliza.estado}
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