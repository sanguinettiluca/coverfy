import { useEffect, useState } from "react";
import api from "../../data/api";

type Coverage = {
    id: string;
    name: string;
    companyId: string;
    insuranceType: string;
};

type Company = {
    id: string;
    name: string;
    commissionRate: number;
    url?: string | null;
    brokerId: string;
    createdAt: string;
    coverages: Coverage[];
};

const PartnerCompaniesCard = () => {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get("/companias")
            .then((response) => {
                setCompanies(response.data ?? []);
            })
            .catch(() => setCompanies([]))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="dashboard-widget">
            <div className="dashboard-widget-title">Compañías con las que trabajás</div>

            {loading && <p className="dashboard-widget-loading">Cargando...</p>}

            {!loading && companies.length === 0 && (
                <p className="dashboard-widget-empty">Todavía no hay compañías registradas</p>
            )}

            {!loading && companies.length > 0 && (
                <div className="dashboard-widget-list">
                    {companies.map((company) => (
                        <div className="dashboard-widget-item" key={company.id}>
                            <div className="dashboard-widget-item-main">
                                {company.url ? (
                                    <a href={company.url} target="_blank" rel="noopener noreferrer" className="dashboard-widget-item-title dashboard-widget-item-link">
                                        {company.name}
                                    </a>
                                ) : (
                                    <span className="dashboard-widget-item-title">{company.name}</span>
                                )}
                                <span className="dashboard-widget-item-sub">
                                    {company.coverages.length}{" "}
                                    {company.coverages.length === 1 ? "cobertura" : "coberturas"}
                                </span>
                            </div>
                            <span className="dashboard-widget-item-badge dashboard-widget-item-badge--ok">
                                {company.commissionRate}%
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PartnerCompaniesCard;