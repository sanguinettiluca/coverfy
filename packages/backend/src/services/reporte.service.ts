import prisma from "../config/prisma";

export async function obtenerEstadisticas(brokerId: string) {

    const polizasActivas = await prisma.poliza.findMany({
        where: {cliente: {brokerId}, estado: "ACTIVA"},
        include: {compania: {select: {nombre: true}}}
    });

    const conteoPorCompania: Record<string, number> = {};

    // Esto podria hacerse con una consulta SQL mas compleja, pero lo hago en memoria para mantenerlo simple
    for(const p of polizasActivas){
        const nombre = p.compania.nombre ?? "Sin Compañia";
        conteoPorCompania[nombre] = (conteoPorCompania[nombre] ?? 0) + 1;
    }

    const polizasActivasPorCompania = Object.entries(conteoPorCompania)
    .map(([nombre, cantidad]) => ({nombre, cantidad}))
    .sort((a, b) => b.cantidad - a.cantidad);

    const clientes = await prisma.cliente.findMany({
        where: {brokerId},
        select: {createdAt: true},
        orderBy: {createdAt: "asc"},
    });

    const altasPorMes: Record<string, number> = {};
    for(const c of clientes){
        const d = c.createdAt;
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        altasPorMes[key] = (altasPorMes[key] ?? 0) + 1;
    }

    let acumulado = 0;
    const clientesAcumuladosPorMes = Object.keys(altasPorMes)
    .sort()
    .map((mes) => {
      acumulado += altasPorMes[mes];
      return { mes, total: acumulado };
    });

    return { polizasActivasPorCompania, clientesAcumuladosPorMes };
}