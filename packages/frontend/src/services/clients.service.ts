import api from "./api";
import type { Client } from "../types";

export async function listClients(search?: string): Promise<{ clients: Client[]; total: number }> {
    const { data } = await api.get("/clientes", { params: { search: search || undefined } });
    return { clients: data.clients ?? data, total: data.total ?? (data.clients ?? data).length };
}

export async function getClient(id: string): Promise<Client> {
    const { data } = await api.get(`/clientes/${id}`);
    return data;
}

export async function createClient(input: Partial<Client>) {
    const { data } = await api.post("/clientes", input);
    return data;
}
