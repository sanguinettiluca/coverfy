export interface CreateCompanyDTO {
    name: string;
    commissionRate?: number;
    website?: string;
}

export interface UpdateCompanyDTO {
    name?: string;
    commissionRate?: number;
    website?: string;
}