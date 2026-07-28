import api from "./api";

export interface Company {
  id: string;
  name: string;
  commissionRate: number;
}

export async function listCompanies(): Promise<Company[]> {
  const { data } = await api.get("/companias");
  return data;
}

export async function updateCompany(id: string, data: Partial<Omit<Company, "id">>): Promise<Company> {
  const { data: res } = await api.put(`/companias/${id}`, data);
  return res;
}
