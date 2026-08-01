import { useEffect, useState } from "react";
import api from "../../data/api";

type Policy = {
    id: string;
    policyNumber: string;
    referenceNumber?: string | null;
    insuranceType: string;
    expirationDate?: string | null;
    status?: string | null;
    client?: { firstName: string; lastName: string } | null;
};

const urgent = 15;
const soon = 30;

const diasHasta = (fecha: string) => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const objetivo = new Date(fecha);
    objetivo.setHours(0, 0, 0, 0);
    return Math.ceil((objetivo.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
};

const getBadgeClass = (dias: number) => {
    if (dias <= urgent) return "dashboard-widget-item-badge--urgent";
    if (dias <= soon) return "dashboard-widget-item-badge--soon";
    return "dashboard-widget-item-badge--ok";
};

const UpcomingPoliciesCard = () => {
    const [polizas, setPolizas] = useState<Policy[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get("/polizas", { params: { perPage: 999999, page: 1, status: "ACTIVE" } })
            .then((response) => {
                const todas: Policy[] = response.data.policies ?? [];
                const conVencimiento = todas
                    .filter((p) => p.expirationDate)
                    .map((p) => ({ ...p, dias: diasHasta(p.expirationDate!) }))
                    .filter((p) => p.dias >= 0)
                    .sort((a, b) => a.dias - b.dias)
                    .slice(0, 8);
                setPolizas(conVencimiento);
            })
            .catch(() => setPolizas([]))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="dashboard-widget">
            <div className="dashboard-widget-title">Pólizas por vencer</div>

            {loading && <p className="dashboard-widget-loading">Cargando...</p>}

            {!loading && polizas.length === 0 && (
                <p className="dashboard-widget-empty">No hay pólizas próximas a vencer</p>
            )}

            {!loading && polizas.length > 0 && (
                <div className="dashboard-widget-list">
                    {polizas.map((poliza) => {
                        const dias = diasHasta(poliza.expirationDate!);
                        return (
                            <div className="dashboard-widget-item" key={poliza.id}>
                                <div className="dashboard-widget-item-main">
                                    <span className="dashboard-widget-item-title">
                                        {poliza.policyNumber}
                                        {poliza.referenceNumber ? ` · Ref. ${poliza.referenceNumber}` : ""}
                                    </span>
                                    <span className="dashboard-widget-item-sub">
                                        {poliza.client
                                            ? `${poliza.client.firstName} ${poliza.client.lastName}`
                                            : poliza.insuranceType}
                                    </span>
                                </div>
                                <span className={`dashboard-widget-item-badge ${getBadgeClass(dias)}`}>
                                    {dias === 0 ? "Hoy" : `${dias} días`}
                                </span>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default UpcomingPoliciesCard;