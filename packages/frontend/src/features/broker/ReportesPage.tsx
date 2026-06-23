import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, BarChart3, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { obtenerEstadisticas } from "@/services/reportes.service";
import { listarClientes } from "@/services/clientes.service";
import { listarPolizas } from "@/services/polizas.service";
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
        
    }


}