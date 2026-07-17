import { useEffect, useState } from "react";
import api from "../../data/api";

type Cliente = {
    id: string;
    nombres: string;
    apellidos: string;
    documento: string;
    createdAt: string;
};

const RecentClientsCard = () => {
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get("/clientes", { params: { porPagina: 5, pagina: 1 } })
            .then((response) => {
                const lista: Cliente[] = response.data.clientes ?? [];
                const ordenados = [...lista]
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .slice(0, 5);
                setClientes(ordenados);
            })
            .catch(() => setClientes([]))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="dashboard-widget">
            <div className="dashboard-widget-title">Últimos clientes</div>

            {loading && <p className="dashboard-widget-loading">Cargando...</p>}

            {!loading && clientes.length === 0 && (
                <p className="dashboard-widget-empty">Todavía no hay clientes registrados</p>
            )}

            {!loading && clientes.length > 0 && (
                <div className="dashboard-widget-list">
                    {clientes.map((cliente) => (
                        <div className="dashboard-widget-item" key={cliente.id}>
                            <div className="dashboard-widget-item-main">
                                <span className="dashboard-widget-item-title">
                                    {cliente.nombres} {cliente.apellidos}
                                </span>
                                <span className="dashboard-widget-item-sub">Doc. {cliente.documento}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default RecentClientsCard;