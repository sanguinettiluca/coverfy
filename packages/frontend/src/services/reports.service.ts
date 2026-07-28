import api from "./api";

export interface Statistics {
  activePoliciesByCompany: { name: string; count: number }[];
  cumulativeClientsByMonth: { month: string; total: number }[];
}

export async function getStatistics(): Promise<Statistics> {
  const { data } = await api.get("/reportes/estadisticas");
  return data;
}
