import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, BarChart3, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getStatistics } from "@/services/reports.service";
import { listClients } from "@/services/clients.service";
import api from "@/services/api";
import jsPDF from "jspdf";

type View = "charts" | "clients" | "policies"; // Esto define los tipos de vistas disponibles

export function ReportsPage() {
    const [view, setView] = useState<View>("charts");
    const [isExporting, setIsExporting] = useState(false);

    const {data: statistics, isLoading: isLoadingStatistics} = useQuery({
        queryKey: ["statistics"],
        queryFn: getStatistics
    });

    const {data: clientsData, isLoading: isLoadingClients} = useQuery({
        queryKey: ["clients-report"],
        queryFn: () => listClients()
    });

    const {data: policiesData, isLoading: isLoadingPolicies} = useQuery({
        queryKey: ["policies-report"],
        queryFn: async () => {
            const {data} = await api.get("/polizas");
            return {policies: data.policies ?? data, total: data.total ?? (data.policies ?? data).length};
        }
    });

    const activeClients = (clientsData?.clients ?? []).filter((c:any) => {
        const policies = policiesData?.policies ?? [];
        return policies.some((p:any) => p.clientId === c.id && p.status === "ACTIVE");
    });

    const activePolicies = (policiesData?.policies ?? []).filter((p:any) => p.status === "ACTIVE");

    const exportPdf = async () => {
        setIsExporting(true);
        try{
            const pdf = new jsPDF("p", "mm", "a4");
            let y = 20;

            pdf.setFontSize(18);
            pdf.text("Coverfy - Reporte", 14, y);
            pdf.setFontSize(10);
            pdf.text(new Date().toLocaleDateString("es-UY"), 14, y + 6);
            y += 20;

            if (statistics) {
                pdf.setFontSize(13);
                pdf.text("Pólizas Activas por Compañía", 14, y);
                y += 7;
                pdf.setFontSize(10);
                statistics.activePoliciesByCompany.forEach((item) => {
                    pdf.text(`${item.name}: ${item.count}`, 16, y);
                    y += 6;
                });

                y += 6;
                pdf.setFontSize(13);
                pdf.text("Clientes Acumulados por Mes", 14, y);
                y += 7;
                pdf.setFontSize(10);
                statistics.cumulativeClientsByMonth.forEach((item) => {
                    pdf.text(`${item.month}: ${item.total}`, 16, y);
                    y += 6;
                });
            }

            pdf.save("reporte-coverfy.pdf");
        }finally{
            setIsExporting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold flex items-center gap-2">
                <BarChart3 className="h-6 w-6" /> Reportes
                </h1>
            </div>

            {/* Navegación de vistas */}
            <div className="flex gap-2">
                {[
                { id: "charts", label: "Gráficos" },
                { id: "clients", label: "Clientes Activos" },
                { id: "policies", label: "Pólizas Activas" },
                ].map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => setView(tab.id as View)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    view === tab.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-card border border-border text-foreground hover:bg-muted"
                    }`}
                >
                    {tab.label}
                </button>
                ))}
            </div>

            {/* Contenido */}
            <div id="contenido-exportar" className="space-y-4">
                {view === "charts" && (
                <>
                    {isLoadingStatistics ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                    ) : statistics ? (
                    <div className="grid grid-cols-2 gap-4">
                        {/* Gráfico 1: Pólizas por compañía */}
                        <div className="bg-card border border-border rounded-lg p-5">
                        <h3 className="font-semibold mb-4">Pólizas Activas por Compañía</h3>
                        <div className="space-y-2">
                            {statistics.activePoliciesByCompany.map((item) => (
                            <div key={item.name} className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">{item.name}</span>
                                <div className="flex items-center gap-2">
                                <div
                                    className="h-2 bg-primary rounded-full"
                                    style={{ width: `${(item.count / 10) * 100}px` }}
                                />
                                <span className="text-sm font-medium w-8 text-right">{item.count}</span>
                                </div>
                            </div>
                            ))}
                        </div>
                        </div>

                        {/* Gráfico 2: Clientes acumulados */}
                        <div className="bg-card border border-border rounded-lg p-5">
                        <h3 className="font-semibold mb-4">Clientes Acumulados por Mes</h3>
                        <div className="space-y-2">
                            {statistics.cumulativeClientsByMonth.map((item) => (
                            <div key={item.month} className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">{item.month}</span>
                                <div className="flex items-center gap-2">
                                <div
                                    className="h-2 bg-secondary rounded-full"
                                    style={{ width: `${(item.total / 10) * 100}px` }}
                                />
                                <span className="text-sm font-medium w-8 text-right">{item.total}</span>
                                </div>
                            </div>
                            ))}
                        </div>
                        </div>
                    </div>
                    ) : null}
                </>
                )}

                {view === "clients" && (
                <div className="bg-card border border-border rounded-lg p-5">
                    <div className="mb-4">
                    <h3 className="font-semibold">Clientes Activos ({activeClients.length})</h3>
                    <p className="text-xs text-muted-foreground">Clientes con al menos una póliza activa</p>
                    </div>
                    {isLoadingClients ? (
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    ) : activeClients.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4">No hay clientes activos.</p>
                    ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-border">
                            <th className="text-left py-2 px-3">Nombre</th>
                            <th className="text-left py-2 px-3">Documento</th>
                            <th className="text-left py-2 px-3">Email</th>
                            <th className="text-left py-2 px-3">Celular</th>
                            </tr>
                        </thead>
                        <tbody>
                            {activeClients.map((c: any) => (
                            <tr key={c.id} className="border-b border-border/50">
                                <td className="py-2 px-3">{c.firstName} {c.lastName}</td>
                                <td className="py-2 px-3">{c.documentNumber}</td>
                                <td className="py-2 px-3">{c.email}</td>
                                <td className="py-2 px-3">{c.phone}</td>
                            </tr>
                            ))}
                        </tbody>
                        </table>
                    </div>
                    )}
                </div>
                )}

                {view === "policies" && (
                <div className="bg-card border border-border rounded-lg p-5">
                    <div className="mb-4">
                    <h3 className="font-semibold">Pólizas Activas ({activePolicies.length})</h3>
                    <p className="text-xs text-muted-foreground">Todas las pólizas en estado activo</p>
                    </div>
                    {isLoadingPolicies ? (
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    ) : activePolicies.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4">No hay pólizas activas.</p>
                    ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-border">
                            <th className="text-left py-2 px-3">Número</th>
                            <th className="text-left py-2 px-3">Tipo</th>
                            <th className="text-left py-2 px-3">Compañía</th>
                            <th className="text-left py-2 px-3">Cliente</th>
                            <th className="text-left py-2 px-3">Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {activePolicies.map((p: any) => (
                            <tr key={p.id} className="border-b border-border/50">
                                <td className="py-2 px-3">{p.policyNumber}</td>
                                <td className="py-2 px-3">{p.insuranceType}</td>
                                <td className="py-2 px-3">{p.company?.name ?? "—"}</td>
                                <td className="py-2 px-3">{p.clientId}</td>
                                <td className="py-2 px-3">{p.status}</td>
                            </tr>
                            ))}
                        </tbody>
                        </table>
                    </div>
                    )}
                </div>
                )}
            </div>

            {/* Botón exportar */}
            <Button onClick={exportPdf} disabled={isExporting} className="gap-2 bg-primary text-primary-foreground">
                <Download className="h-4 w-4" />
                {isExporting ? "Exportando..." : "Exportar PDF"}
            </Button>
        </div>
    );

}
