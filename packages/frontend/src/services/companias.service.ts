import api from "./api";

export interface Compania {
  id: string;
  nombre: string;
  porcentajeComision: number;
}

export async function listarCompanias(): Promise<Compania[]> {
  const { data } = await api.get("/companias");
  return data;
}

export async function actualizarCompania(id: string, data: Partial<Omit<Compania, "id">>): Promise<Compania> {
  const { data: res } = await api.put(`/companias/${id}`, data);
  return res;
}