import api from "./api";

export interface Compania {
  id: string;
  nombre: string;
}

export async function listarCompanias(): Promise<Compania[]> {
  const { data } = await api.get("/companias");
  return data;
}