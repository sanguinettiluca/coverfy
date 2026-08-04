export type Client = {
    id: string;
    firstName: string;
    lastName: string;
    documentNumber: string;
    phone: string;
    email: string;
    createdAt: string;
};

export type PolicyClient = {
    firstName: string;
    lastName: string;
    documentNumber: string;
};

export type Policy = {
    id: string;
    policyNumber: string;
    referenceNumber?: string | null;
    insuranceType: string;
    status?: string | null;
    startDate?: string | null;
    expirationDate?: string | null;
    totalAmount?: number | null;
    client?: PolicyClient | null;
    broker?: { id: string; name: string } | null;
    vehicleDetails?: { licensePlate: string } | null;
    createdAt: string;
};

export type InsuranceTypeFilter = "" | "VEHICLE" | "TRIP" | "RENTAL" | "HOME" | "BUSINESS" | "LIABILITY" | "BOND" | "LIFE" | "OTHER";

export type SearchMode = "clients" | "policies";

export type ClientSortField = "name" | "document" | "createdAt";
export type PolicySortField = "policyNumber" | "expirationDate" | "totalAmount" | "createdAt";

export type SortOrder = "asc" | "desc";

export const TIPO_LABEL: Record<string, string> = {
    VEHICLE: "Vehículo",
    TRIP: "Viaje",
    RENTAL: "Alquiler",
    HOME: "Hogar",
    BUSINESS: "Comercio",
    LIABILITY: "Resp. Civil",
    BOND: "Fianza",
    LIFE: "Vida",
    OTHER: "Otros",
};

export const ESTADO_LABEL: Record<string, string> = {
    ACTIVE: "Activa",
    EXPIRED: "Vencida",
    CANCELLED: "Cancelada",
    SUSPENDED: "Suspendida",
};

export type PolicyStatusFilter = "" | "ACTIVE" | "EXPIRED" | "CANCELLED" | "SUSPENDED";

export type SubBroker = {
    id: string;
    name: string;
};

