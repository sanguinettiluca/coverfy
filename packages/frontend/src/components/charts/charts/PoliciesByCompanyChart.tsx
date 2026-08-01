import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip } from "chart.js";
import api from "../../../data/api"; 
import { getChartColors, CHART_PALETTE } from "../chartTheme";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

type Company = {
    id: string;
    name: string;
};

type Policy = {
    id: string;
    companyId: string;
};

const PoliciesByCompanyChart = () => {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [policies, setPolicies] = useState<Policy[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            api.get("/companias"),
            api.get("/polizas", { params: { perPage: 999999, page: 1 } }),
        ])
            .then(([companiesRes, policiesRes]) => {
                setCompanies(companiesRes.data ?? []);
                setPolicies(policiesRes.data.policies ?? []);
            })
            .catch(() => {
                setCompanies([]);
                setPolicies([]);
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="charts-loading">Cargando datos...</div>;
    if (policies.length === 0) return <div className="charts-empty">No hay pólizas registradas</div>;

    const counts: Record<string, number> = {};
    policies.forEach((p) => {
        counts[p.companyId] = (counts[p.companyId] ?? 0) + 1;
    });

    const labels = Object.keys(counts).map(
        (id) => companies.find((c) => c.id === id)?.name ?? "Desconocida"
    );
    const colors = getChartColors();

    return (
        <div className="charts-canvas-wrapper">
            <Bar
                data={{
                    labels,
                    datasets: [
                        {
                            label: "Pólizas",
                            data: Object.values(counts),
                            backgroundColor: labels.map((_, i) => CHART_PALETTE[i % CHART_PALETTE.length]),
                            borderRadius: 6,
                        },
                    ],
                }}
                options={{
                    indexAxis: "y",
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        x: {
                            ticks: { color: colors.text, stepSize: 1 },
                            grid: { color: colors.grid },
                            beginAtZero: true,
                        },
                        y: {
                            ticks: { color: colors.text, font: { size: 12 } },
                            grid: { display: false },
                        },
                    },
                }}
            />
        </div>
    );
};

export default PoliciesByCompanyChart;