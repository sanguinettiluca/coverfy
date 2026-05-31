import api from "./api";
import type { Cliente } from "../types";

export async function listarClientes(): Promise<Cliente[]> {
    const { data } = await api.get("/clientes");
    // El backend pagina, los clientes vienen en data.clientes
    return data.clientes ?? data;
}

export async function obtenerCliente(id: string): Promise<Cliente> {
    const { data } = await api.get(`/clientes/${id}`);
    return data;
}

export async function crearCliente(input: Partial<Cliente>) {
    const { data } = await api.post("/clientes", input);
    return data;
}