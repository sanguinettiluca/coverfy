export type InsuranceType =
    | "VEHICLE" | "TRIP" | "RENTAL" | "HOME" | "BUSINESS"
    | "LIABILITY" | "BOND" | "LIFE" | "OTHER";

export type Coverage = {
    id: string;
    name: string;
    companyId: string;
    insuranceType: InsuranceType;
};

export type Company = {
    id: string;
    name: string;
    commissionRate: number;
    url?: string | null;
    coverages: Coverage[];
};

export type CompanyForm = {
    companyId: string;
    name: string;
    commissionRate?: number;
    url?: string;
};

export const TIPO_LABEL: Record<InsuranceType, string> = {
    VEHICLE: "Vehículo",
    TRIP: "Viaje",
    RENTAL: "Alquiler",
    HOME: "Hogar",
    BUSINESS: "Comercio",
    LIABILITY: "Responsabilidad Civil",
    BOND: "Fianza",
    LIFE: "Vida",
    OTHER: "Otros",
};