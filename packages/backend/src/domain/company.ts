export interface CreateCompanyDTO {
    name: string;
    commissionRate?: number;
    url?: string;
}

export interface UpdateCompanyDTO {
    name?: string;
    commissionRate?: number;
    url?: string;
}