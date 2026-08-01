import { useEffect, useState } from "react";
import api from "../../data/api";

type Client = {
    id: string;
    fistName: string;
    lastName: string;
    documentNumber: string;
    createdAt: string;
};

const RecentClientsCard = () => {
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get("/clientes", { params: { perPage: 5, pagina: 1 } })
            .then((response) => {
                const list: Client[] = response.data.clients ?? [];
                const ordenados = [...list]
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .slice(0, 5);
                setClients(ordenados);
            })
            .catch(() => setClients([]))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="dashboard-widget">
            <div className="dashboard-widget-title">Últimos clientes</div>

            {loading && <p className="dashboard-widget-loading">Cargando...</p>}

            {!loading && clients.length === 0 && (
                <p className="dashboard-widget-empty">Todavía no hay clientes registrados</p>
            )}

            {!loading && clients.length > 0 && (
                <div className="dashboard-widget-list">
                    {clients.map((client) => (
                        <div className="dashboard-widget-item" key={client.id}>
                            <div className="dashboard-widget-item-main">
                                <span className="dashboard-widget-item-title">
                                    {client.fistName} {client.lastName}
                                </span>
                                <span className="dashboard-widget-item-sub">Doc. {client.documentNumber}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default RecentClientsCard;