import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip } from "chart.js";
import api from "../../../data/api"; // adjust path as needed
import { getChartColors } from "../chartTheme";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

const TYPE_LABEL: Record<string, string> = {
    VEHICLE: "Vehículo",
    TRIP: "Viaje",
    RENTAL: "Alquiler",
    HOME: "Hogar",
    BUSINESS: "Comercio",
    LIABILITY: "Resp. Civil",
    BOND: "Fianza",
    LIFE: "Vida",
    OTHER: "Otros",
};

type Policy = {
    id: string;
    insuranceType: string;
};

const PoliciesByTypeChart = () => {
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
        counts[p.insuranceType] = (counts[p.insuranceType] ?? 0) + 1;
    });

    const labels = Object.keys(counts).map((t) => TYPE_LABEL[t] ?? t);
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
                            backgroundColor: colors.accent,
                            borderRadius: 6,
                            maxBarThickness: 46,
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

export default PoliciesByTypeChart;