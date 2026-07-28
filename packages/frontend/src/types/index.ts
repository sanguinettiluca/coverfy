export type Role = "ADMIN" | "BROKER" | "SUB_BROKER";

export interface User {
    id: string;
    name: string;
    email: string;
    role: Role;
    brokerId?: string;
}

export interface AuthResponse {
    accessToken: string;
    user: User;
}

export interface Client {
    id: string;
    firstName: string;
    lastName: string;
    documentNumber: string;
    email: string;
    phone: string;
    address: string;
}
