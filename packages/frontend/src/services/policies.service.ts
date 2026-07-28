import api from "./api";

export async function createPolicy(input: Record<string, any>) {
  const { data } = await api.post("/polizas", input);
  return data;
}

export async function getPolicy(id:string) {
  const {data} = await api.get(`/polizas/${id}`);
  return data;
}

export async function updatePolicy(id: string, input: Record<string, any>){
  const data = await api.put(`/polizas/${id}`, input);
  return data;
}

export async function listActivePoliciesByCompany(companyId: string): Promise<any[]> {
  const { data } = await api.get("/polizas", {
    params: { companyId, status: "ACTIVE", perPage: 1000 }
  });
  return data.policies ?? data;
}
