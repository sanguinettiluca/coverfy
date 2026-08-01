import { useEffect, useState } from "react";
import api from "../../data/api"; // ajustá el path real

type Company = {
    id: string;
    name: string;
    commissionRate: number;
    brokerId: string;
    createdAt: string;
};

type Policy = {
    id: string;
    policyNumber: string;
    insuranceType: string;
    totalAmount?: number | null;
    client?: { firstName: string; lastName: string } | null;
};

const TIPO_LABEL: Record<string, string> = {
    VEHICLE: "Vehículo",
    TRIP: "Viaje",
    RENTAL: "Alquiler",
    HOME: "Hogar",
    BUSINESS: "Comercio",
    LIABILITY: "Resp. Civil",
    BOND: "Fianza",
    LIFE: "Vida",
    OTHER: "Otros",
};

const formatMoney = (value: number) =>
    value.toLocaleString("es-UY", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const CommissionsPage = () => {
    const [companias, setCompanias] = useState<Company[]>([]);
    const [cargandoCompanias, setCargandoCompanias] = useState(true);

    const [companiaId, setCompaniaId] = useState("");
    const [polizas, setPolizas] = useState<Policy[]>([]);
    const [cargandoPolizas, setCargandoPolizas] = useState(false);

    useEffect(() => {
        api.get("/companies")
            .then((response) => setCompanias(response.data ?? []))
            .catch(() => setCompanias([]))
            .finally(() => setCargandoCompanias(false));
    }, []);

    const compania = companias.find((c) => c.id === companiaId) ?? null;

    useEffect(() => {
        if (!companiaId) {
            setPolizas([]);
            return;
        }
        setCargandoPolizas(true);
        api.get("/polizas", { params: { companyId: companiaId, status: "ACTIVE", perPage: 1000, page: 1 } })
            .then((response) => setPolizas(response.data.policies ?? []))
            .catch(() => setPolizas([]))
            .finally(() => setCargandoPolizas(false));
    }, [companiaId]);

    const totalMonto = polizas.reduce((s, p) => s + (p.totalAmount ?? 0), 0);
    const totalComision = compania ? totalMonto * (compania.commissionRate / 100) : 0;

    return (
        <div className="commissions-page">

            <div className="commissions-header">
                <h1 className="dashboard-title">Comisiones</h1>
                <p className="dashboard-sub">
                    Seleccioná una compañía para ver sus pólizas activas y el total de comisión generado.
                </p>
            </div>

            <div className="commissions-select-row">
                <select
                    value={companiaId}
                    onChange={(e) => setCompaniaId(e.target.value)}
                    disabled={cargandoCompanias}
                >
                    <option value="">
                        {cargandoCompanias ? "Cargando compañías..." : "— Seleccionar compañía —"}
                    </option>
                    {companias.map((c) => (
                        <option key={c.id} value={c.id}>
                            {c.name} ({c.commissionRate}%)
                        </option>
                    ))}
                </select>
            </div>

            {compania && (
                <>
                    <div className="commissions-compania-card">
                        <span className="commissions-compania-nombre">{compania.name}</span>
                        <span className="commissions-compania-sep">·</span>
                        <span className="dashboard-widget-item-sub">Comisión:</span>
                        <span className="commissions-compania-nombre">
                            {compania.commissionRate}%
                        </span>
                    </div>

                    <div className="commissions-stats-grid">
                        <div className="commissions-stat-card">
                            <span className="commissions-stat-label">Pólizas activas</span>
                            <span className="commissions-stat-value">{polizas.length}</span>
                        </div>
                        <div className="commissions-stat-card">
                            <span className="commissions-stat-label">Prima total</span>
                            <span className="commissions-stat-value">$ {formatMoney(totalMonto)}</span>
                        </div>
                        <div className="commissions-stat-card commissions-stat-card--highlight">
                            <span className="commissions-stat-label">
                                Comisión total ({compania.commissionRate}%)
                            </span>
                            <span className="commissions-stat-value">$ {formatMoney(totalComision)}</span>
                        </div>
                    </div>

                    {cargandoPolizas ? (
                        <p className="dashboard-widget-loading">Cargando pólizas...</p>
                    ) : polizas.length === 0 ? (
                        <p className="client-result-empty">No hay pólizas activas para esta compañía.</p>
                    ) : (
                        <div className="commissions-table-wrapper">
                            <table className="commissions-table">
                                <thead>
                                    <tr>
                                        <th>N° Póliza</th>
                                        <th>Tipo</th>
                                        <th>Cliente</th>
                                        <th className="th--right">Monto Total</th>
                                        <th className="th--right">Comisión</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {polizas.map((p) => {
                                        const comision = (p.totalAmount ?? 0) * (compania.commissionRate / 100);
                                        return (
                                            <tr key={p.id}>
                                                <td className="td--mono">{p.policyNumber || "—"}</td>
                                                <td>{TIPO_LABEL[p.insuranceType] ?? p.insuranceType}</td>
                                                <td className="td--muted">
                                                    {p.client ? `${p.client.firstName} ${p.client.lastName}` : "—"}
                                                </td>
                                                <td className="td--right">
                                                    $ {formatMoney(p.totalAmount ?? 0)}
                                                </td>
                                                <td className="td--right td--commission">
                                                    $ {formatMoney(comision)}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}

        </div>
    );
};

export default CommissionsPage;