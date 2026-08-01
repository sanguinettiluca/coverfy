import { useState } from "react";
import { PieChart, BarChart3, Building2, TrendingUp } from "lucide-react";
import PoliciesByStatusCharts from "./charts/PoliciesByStatusCharts";
import PoliciesByTypeChart from "./charts/PoliciesByTypeChart";
import PoliciesByCompanyChart from "./charts/PoliciesByCompanyChart";
import PoliciesTimelineChart from "./charts/PoliciesTimelineChart";

type ChartTab = {
    id: string;
    label: string;
    icon: React.ReactNode;
    title: string;
    sub: string;
    component: React.ReactNode;
};

const TABS: ChartTab[] = [
    {
        id: "status",
        label: "Por estado",
        icon: <PieChart size={15} />,
        title: "Pólizas por estado",
        sub: "Distribución de tu cartera según el estado actual de cada póliza",
        component: <PoliciesByStatusCharts />,
    },
    {
        id: "type",
        label: "Por tipo de seguro",
        icon: <BarChart3 size={15} />,
        title: "Pólizas por tipo de seguro",
        sub: "Cantidad de pólizas agrupadas por tipo de cobertura",
        component: <PoliciesByTypeChart />,
    },
    {
        id: "company",
        label: "Por compañía",
        icon: <Building2 size={15} />,
        title: "Pólizas por compañía",
        sub: "Cantidad de pólizas contratadas con cada compañía aseguradora",
        component: <PoliciesByCompanyChart />,
    },
    {
        id: "timeline",
        label: "Evolución mensual",
        icon: <TrendingUp size={15} />,
        title: "Pólizas creadas por mes",
        sub: "Evolución de altas de pólizas en los últimos 6 meses",
        component: <PoliciesTimelineChart />,
    },
];

const ChartsPage = () => {
    const [activeTab, setActiveTab] = useState(TABS[0].id);

    const current = TABS.find((t) => t.id === activeTab) ?? TABS[0];

    return (
        <div className="charts-page">

            <div className="charts-header">
                <h1 className="dashboard-title">Gráficas</h1>
                <p className="dashboard-sub">Visualizá el estado de tu cartera desde distintos ángulos</p>
            </div>

            <div className="charts-tabs">
                {TABS.map((tab) => (
                    <button
                        key={tab.id}
                        type="button"
                        className={`charts-tab ${activeTab === tab.id ? "charts-tab--active" : ""}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="charts-card">
                <div className="charts-card-title">{current.title}</div>
                <div className="charts-card-sub">{current.sub}</div>
                {current.component}
            </div>

        </div>
    );
};

export default ChartsPage;