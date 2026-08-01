import { useEffect, useState } from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import api from "../../../data/api"; 
import { getChartColors } from "../chartTheme";

ChartJS.register(ArcElement, Tooltip, Legend);

type Policy = {
    id: string;
    status?: string | null;
};

const STATUS_LABEL: Record<string, string> = {
    ACTIVE: "Activa",
    EXPIRED: "Vencida",
    CANCELLED: "Cancelada",
    SUSPENDED: "Suspendida",
};

const STATUS_COLOR: Record<string, string> = {
    ACTIVE: "#3fb950",
    EXPIRED: "#ff5e00",
    CANCELLED: "#fd0000",
    SUSPENDED: "#d29922",
};

const PoliciesByStatusCharts = () => {
    const [policies, setPolicies] = useState<Policy[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get("/polizas", { params: { perPage: 999999, page: 1 } })
            .then((response) => setPolicies(response.data.policies ?? []))
            .catch(() => setPolicies([]))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="charts-loading">Cargando datos...</div>;
    if (policies.length === 0) return <div className="charts-empty">No hay pólizas registradas</div>;

    const counts: Record<string, number> = {};
    policies.forEach((p) => {
        const status = p.status ?? "SIN_ESTADO";
        counts[status] = (counts[status] ?? 0) + 1;
    });

    const statusKeys = Object.keys(counts);
    const labels = statusKeys.map((s) => STATUS_LABEL[s] ?? s);
    const colors = getChartColors();

    return (
        <div className="charts-canvas-wrapper">
            <Doughnut
                data={{
                    labels,
                    datasets: [
                        {
                            data: Object.values(counts),
                            backgroundColor: statusKeys.map((s) => STATUS_COLOR[s] ?? colors.textFaint),
                            borderColor: colors.bgAlt,
                            borderWidth: 2,
                        },
                    ],
                }}
                options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: "bottom",
                            labels: { color: colors.text, padding: 16, font: { size: 12 } },
                        },
                    },
                }}
            />
        </div>
    );
};

export default PoliciesByStatusCharts;