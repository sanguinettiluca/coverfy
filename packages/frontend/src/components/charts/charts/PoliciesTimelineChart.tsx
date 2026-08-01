import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Filler,
} from "chart.js";
import api from "../../../data/api"; 
import { getChartColors } from "../chartTheme";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

type Policy = {
    id: string;
    createdAt: string;
};

const MONTHS = [
    "Ene", "Feb", "Mar", "Abr", "May", "Jun",
    "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
];

const PoliciesTimelineChart = () => {
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

    // Últimos 6 meses, incluyendo el actual
    const today = new Date();
    const months: { key: string; label: string }[] = [];
    for (let i = 5; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        months.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: `${MONTHS[d.getMonth()]} ${d.getFullYear()}` });
    }

    const counts: Record<string, number> = {};
    months.forEach((m) => (counts[m.key] = 0));

    policies.forEach((p) => {
        const d = new Date(p.createdAt);
        const key = `${d.getFullYear()}-${d.getMonth()}`;
        if (key in counts) counts[key] += 1;
    });

    const colors = getChartColors();

    return (
        <div className="charts-canvas-wrapper">
            <Line
                data={{
                    labels: months.map((m) => m.label),
                    datasets: [
                        {
                            label: "Pólizas creadas",
                            data: months.map((m) => counts[m.key]),
                            borderColor: colors.accent,
                            backgroundColor: colors.accent + "22",
                            fill: true,
                            tension: 0.3,
                            pointRadius: 4,
                            pointBackgroundColor: colors.accent,
                        },
                    ],
                }}
                options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        x: {
                            ticks: { color: colors.text, font: { size: 12 } },
                            grid: { display: false },
                        },
                        y: {
                            ticks: { color: colors.text, stepSize: 1 },
                            grid: { color: colors.grid },
                            beginAtZero: true,
                        },
                    },
                }}
            />
        </div>
    );
};

export default PoliciesTimelineChart;