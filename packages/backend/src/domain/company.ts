export interface CreateCompanyDTO {
    name: string;
    commissionRate?: number;
}

export interface UpdateCompanyDTO {
    name?: string;
    commissionRate?: number;
}
