import api from "./api";

export async function crearPoliza(input: Record<string, any>) {
  const { data } = await api.post("/polizas", input);
  return data;
}