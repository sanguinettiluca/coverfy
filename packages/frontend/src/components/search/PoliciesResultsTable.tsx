import { Link } from "react-router";
import type { Policy } from "./search.type";
import { TIPO_LABEL, ESTADO_LABEL } from "./search.type";

type Props = {
    polizas: Policy[];
};

const formatMoney = (value?: number | null) =>
    value != null ? `$ ${value.toLocaleString("es-UY", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "-";

const formatFecha = (fecha?: string | null) =>
    fecha ? new Date(fecha).toLocaleDateString("es-UY") : "-";

const PoliciesResultsTable = ({ polizas }: Props) => {
    if (polizas.length === 0) {
        return <p className="client-result-empty">No se encontraron pólizas</p>;
    }

    return (
        <div className="commissions-table-wrapper">
            <table className="commissions-table">
                <thead>
                    <tr>
                        <th>N° Póliza</th>
                        <th>Referencia</th>
                        <th>Tipo</th>
                        <th>Estado</th>
                        <th>Cliente</th>
                        <th>Vencimiento</th>
                        <th className="th--right">Monto</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {polizas.map((p) => (
                        <tr key={p.id}>
                            <td className="td--mono">{p.policyNumber}</td>
                            <td className="td--muted">{p.referenceNumber || "-"}</td>
                            <td>{TIPO_LABEL[p.insuranceType] ?? p.insuranceType}</td>
                            <td>{p.status ? (ESTADO_LABEL[p.status] ?? p.status) : "-"}</td>
                            <td className="td--muted">
                                {p.client ? `${p.client.firstName} ${p.client.lastName}` : "-"}
                            </td>
                            <td className="td--muted">{formatFecha(p.expirationDate)}</td>
                            <td className="td--right">{formatMoney(p.totalAmount)}</td>
                            <td>
                                <Link to={`/policies/search?referencia=${p.referenceNumber ?? ""}`}>Ver</Link>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default PoliciesResultsTable;