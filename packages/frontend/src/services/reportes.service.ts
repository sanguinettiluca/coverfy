import api from "./api";

export interface Estadisticas {
  polizasActivasPorCompania: { nombre: string; cantidad: number }[];
  clientesAcumuladosPorMes: { mes: string; total: number }[];
}

export async function obtenerEstadisticas(): Promise<Estadisticas> {
  const { data } = await api.get("/reportes/estadisticas");
  return data;
}