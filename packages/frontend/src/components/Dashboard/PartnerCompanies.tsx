import { useEffect, useState } from "react";
import api from "../../data/api"; 

type Cobertura = {
    id: string;
    nombre: string;
    companiaId: string;
    tipoSeguro: string;
};

type Compania = {
    id: string;
    nombre: string;
    porcentajeComision: number;
    brokerId: string;
    createdAt: string;
    coberturas: Cobertura[];
};

const PartnerCompaniesCard = () => {
    const [companias, setCompanias] = useState<Compania[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get("/companias")
            .then((response) => {
                setCompanias(response.data ?? []);
            })
            .catch(() => setCompanias([]))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="dashboard-widget">
            <div className="dashboard-widget-title">Compañías con las que trabajás</div>

            {loading && <p className="dashboard-widget-loading">Cargando...</p>}

            {!loading && companias.length === 0 && (
                <p className="dashboard-widget-empty">Todavía no hay compañías registradas</p>
            )}

            {!loading && companias.length > 0 && (
                <div className="dashboard-widget-list">
                    {companias.map((compania) => (
                        <div className="dashboard-widget-item" key={compania.id}>
                            <div className="dashboard-widget-item-main">
                                <span className="dashboard-widget-item-title">{compania.nombre}</span>
                                <span className="dashboard-widget-item-sub">
                                    {compania.coberturas.length}{" "}
                                    {compania.coberturas.length === 1 ? "cobertura" : "coberturas"}
                                </span>
                            </div>
                            <span className="dashboard-widget-item-badge dashboard-widget-item-badge--ok">
                                {compania.porcentajeComision}%
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PartnerCompaniesCard;