import { useEffect, useState } from "react";
import api from "../../data/api";

type Poliza = {
    id: string;
    numeroPoliza: string;
    numeroReferencia?: string | null;
    tipoSeguro: string;
    fechaVencimiento?: string | null;
    estado?: string | null;
    cliente?: { nombres: string; apellidos: string } | null;
};

const DIAS_URGENTE = 15;
const DIAS_PRONTO = 30;

const diasHasta = (fecha: string) => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const objetivo = new Date(fecha);
    objetivo.setHours(0, 0, 0, 0);
    return Math.ceil((objetivo.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
};

const getBadgeClass = (dias: number) => {
    if (dias <= DIAS_URGENTE) return "dashboard-widget-item-badge--urgent";
    if (dias <= DIAS_PRONTO) return "dashboard-widget-item-badge--soon";
    return "dashboard-widget-item-badge--ok";
};

const UpcomingPoliciesCard = () => {
    const [polizas, setPolizas] = useState<Poliza[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // NOTA: listarPolizas no soporta orderBy fechaVencimiento ni filtro por rango de fechas.
        // Traemos un lote grande y ordenamos/filtramos en el cliente.
        // Lo ideal sería un endpoint GET /polizas/vencimientos en el backend.
        api.get("/polizas", { params: { porPagina: 1000, pagina: 1, estado: "ACTIVA" } })
            .then((response) => {
                const todas: Poliza[] = response.data.polizas ?? [];
                const conVencimiento = todas
                    .filter((p) => p.fechaVencimiento)
                    .map((p) => ({ ...p, dias: diasHasta(p.fechaVencimiento!) }))
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
                        const dias = diasHasta(poliza.fechaVencimiento!);
                        return (
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