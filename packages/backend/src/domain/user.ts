import e from "express"
import { Role } from "../generated/prisma"

// DTO (Data Transfer Object) para la creación de un nuevo usuario
export interface CreateUserDTO {
    email: string
    password: string
    nombre: string
    role: Role
    brokerId?: string //Solo para usuarios con rol de sub-broker
}

// DTO para el login de un usuario
export interface LoginDTO {
    email: string
    password: string
}

// Payload que se incluirá en el JWT al autenticar a un usuario
// No incluye información sensible como la contraseña
export interface JwtPayload {
    userId: string
    email: string
    role: Role
    brokerId?: string | null // El broker al que pertenece (null si es admin o broker)
}

export interface AuthResponse {
    accessToken: string
    user: {
        id: string
        email: string
        nombre: string
        role: Role
        brokerId?: string | null
    }
}