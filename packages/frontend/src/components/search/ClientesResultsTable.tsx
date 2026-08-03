import { Link } from "react-router";
import type { Client } from "./search.type";

type Props = {
    clientes: Client[];
};

const formatFecha = (fecha?: string | null) =>
    fecha ? new Date(fecha).toLocaleDateString("es-UY") : "-";

const ClientsResultsTable = ({ clientes }: Props) => {
    if (clientes.length === 0) {
        return <p className="client-result-empty">No se encontraron clientes</p>;
    }

    return (
        <div className="commissions-table-wrapper">
            <table className="commissions-table">
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Cédula</th>
                        <th>Teléfono</th>
                        <th>Email</th>
                        <th>Alta</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {clientes.map((c) => (
                        <tr key={c.id}>
                            <td>{c.firstName} {c.lastName}</td>
                            <td className="td--mono">{c.documentNumber}</td>
                            <td className="td--muted">{c.phone}</td>
                            <td className="td--muted">{c.email}</td>
                            <td className="td--muted">{formatFecha(c.createdAt)}</td>
                            <td>
                                <Link to={`/clients/search?documento=${c.documentNumber}`}>Ver</Link>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ClientsResultsTable;