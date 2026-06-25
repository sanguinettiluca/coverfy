import api from "./api";

export async function crearPoliza(input: Record<string, any>) {
  const { data } = await api.post("/polizas", input);
  return data;
}

export async function obtenerPoliza(id:string) {
  const {data} = await api.get(`/polizas/${id}`);
  return data;
}

export async function actualizarPoliza(id: string, input: Record<string, any>){
  const data = await api.put(`/polizas/${id}`, input);
  return data;
}

export async function listarPolizasActivasPorCompania(companiaId: string): Promise<any[]> {
  const { data } = await api.get("/polizas", {
    params: { companiaId, estado: "ACTIVA", porPagina: 1000 }
  });
  return data.polizas ?? data;
}