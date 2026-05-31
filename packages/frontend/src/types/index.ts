export type Role = "ADMIN" | "BROKER" | "SUB_BROKER";

export interface User {
    id: string;
    nombre: string;
    email: string;
    role: Role;
    brokerId?: string;
}

export interface AuthResponse{
    token: string;
    user: User;
}