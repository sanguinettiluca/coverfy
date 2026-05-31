export type Role = "ADMIN" | "BROKER" | "SUB_BROKER";

export interface User {
    id: string;
    nombre: string;
    email: string;
    role: Role;
    brokerId?: string;
}

export interface AuthResponse {
    accessToken: string;
    user: User;
}

export interface Cliente {
    id: string;
    nombres: string;
    apellidos: string;
    documento: string;
    email: string;
    celular: string;
    direccion: string;
}