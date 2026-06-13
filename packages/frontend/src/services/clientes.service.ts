import api from "./api";
import type { Cliente } from "../types";

export async function listarClientes(busqueda?: string): Promise<{ clientes: Cliente[]; total: number }> {
    const { data } = await api.get("/clientes", { params: { busqueda: busqueda || undefined } });
    return { clientes: data.clientes ?? data, total: data.total ?? (data.clientes ?? data).length };
}

export async function obtenerCliente(id: string): Promise<Cliente> {
    const { data } = await api.get(`/clientes/${id}`);
    return data;
}

export async function crearCliente(input: Partial<Cliente>) {
    const { data } = await api.post("/clientes", input);
    return data;
}