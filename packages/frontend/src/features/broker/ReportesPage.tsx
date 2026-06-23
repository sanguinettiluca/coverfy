import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, BarChart3, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { obtenerEstadisticas } from "@/services/reportes.service";
import { listarClientes } from "@/services/clientes.service";
import api from "@/services/api";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

type Vista = "graficos" | "clientes" | "polizas"; // Esto define los tipos de vistas disponibles

export function ReportesPage() {
    const [vista, setVista] = useState<Vista>("graficos");
    const [exportandoURL, setExportandoURL] = useState(false);

    const {data: estadisticas, isLoading: cargandoEstadisticas} = useQuery({
        queryKey: ["estadisticas"],
        queryFn: obtenerEstadisticas
    });

    const {data: datosClientes, isLoading: cargandoClientes} = useQuery({
        queryKey: ["clientes-reporte"],
        queryFn: () => listarClientes()
    });

    const {data: datosPolizas, isLoading: cargandoPolizas} = useQuery({
        queryKey: ["polizas-reporte"],
        queryFn: async () => {
            const {data} = await api.get("/polizas");
            return {clientes: data.polizas ?? data, total: data.total ?? (data.polizas ?? data).length};
        }
    });

    const clientes = (datosClientes?.clientes ?? []).filter((c:any) => {
        const polizas = datosPolizas?.clientes ?? [];
        return polizas.some((p:any) => p.clienteId === c.id && p.estado === "ACTIVA");
    });

    const polizas = (datosPolizas?.clientes ?? []).filter((p:any) => p.estado === "ACTIVA");

    const exportarPDF = async () => {
        setExportandoURL(true);
        try{
            const elemento = document.getElementById("contenido-exportar");
            if(!elemento){
                return;
            }

            const canvas = await html2canvas(elemento, {scale: 2});
            const pdf = new jsPDF("p", "mm", "a4");
            const imgData = canvas.toDataURL("image/png");
            const imgWidth = 210;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
            pdf.save("reporte.pdf");
        }finally{
            setExportandoURL(false);
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
                { id: "graficos", label: "Gráficos" },
                { id: "clientes", label: "Clientes Activos" },
                { id: "polizas", label: "Pólizas Activas" },
                ].map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => setVista(tab.id as Vista)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    vista === tab.id
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
                {vista === "graficos" && (
                <>
                    {cargandoEstadisticas ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                    ) : estadisticas ? (
                    <div className="grid grid-cols-2 gap-4">
                        {/* Gráfico 1: Pólizas por compañía */}
                        <div className="bg-card border border-border rounded-lg p-5">
                        <h3 className="font-semibold mb-4">Pólizas Activas por Compañía</h3>
                        <div className="space-y-2">
                            {estadisticas.polizasActivasPorCompania.map((item) => (
                            <div key={item.nombre} className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">{item.nombre}</span>
                                <div className="flex items-center gap-2">
                                <div
                                    className="h-2 bg-primary rounded-full"
                                    style={{ width: `${(item.cantidad / 10) * 100}px` }}
                                />
                                <span className="text-sm font-medium w-8 text-right">{item.cantidad}</span>
                                </div>
                            </div>
                            ))}
                        </div>
                        </div>

                        {/* Gráfico 2: Clientes acumulados */}
                        <div className="bg-card border border-border rounded-lg p-5">
                        <h3 className="font-semibold mb-4">Clientes Acumulados por Mes</h3>
                        <div className="space-y-2">
                            {estadisticas.clientesAcumuladosPorMes.map((item) => (
                            <div key={item.mes} className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">{item.mes}</span>
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

                {vista === "clientes" && (
                <div className="bg-card border border-border rounded-lg p-5">
                    <div className="mb-4">
                    <h3 className="font-semibold">Clientes Activos ({clientes.length})</h3>
                    <p className="text-xs text-muted-foreground">Clientes con al menos una póliza activa</p>
                    </div>
                    {cargandoClientes ? (
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    ) : clientes.length === 0 ? (
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
                            {clientes.map((c: any) => (
                            <tr key={c.id} className="border-b border-border/50">
                                <td className="py-2 px-3">{c.nombres} {c.apellidos}</td>
                                <td className="py-2 px-3">{c.documento}</td>
                                <td className="py-2 px-3">{c.email}</td>
                                <td className="py-2 px-3">{c.celular}</td>
                            </tr>
                            ))}
                        </tbody>
                        </table>
                    </div>
                    )}
                </div>
                )}

                {vista === "polizas" && (
                <div className="bg-card border border-border rounded-lg p-5">
                    <div className="mb-4">
                    <h3 className="font-semibold">Pólizas Activas ({polizas.length})</h3>
                    <p className="text-xs text-muted-foreground">Todas las pólizas en estado activo</p>
                    </div>
                    {cargandoPolizas ? (
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    ) : polizas.length === 0 ? (
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
                            {polizas.map((p: any) => (
                            <tr key={p.id} className="border-b border-border/50">
                                <td className="py-2 px-3">{p.numeroPoliza}</td>
                                <td className="py-2 px-3">{p.tipoSeguro}</td>
                                <td className="py-2 px-3">{p.compania?.nombre ?? "—"}</td>
                                <td className="py-2 px-3">{p.clienteId}</td>
                                <td className="py-2 px-3">{p.estado}</td>
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
            <Button onClick={exportarPDF} disabled={exportandoURL} className="gap-2 bg-primary text-primary-foreground">
                <Download className="h-4 w-4" />
                {exportandoURL ? "Exportando..." : "Exportar PDF"}
            </Button>
        </div>
    );

}