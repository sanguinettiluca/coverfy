import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import prisma from "../config/prisma"
import { CreateUserDTO, JwtPayload, LoginDTO, AuthResponse } from "../domain/user"
import { Role } from "../generated/prisma"
import e from "express"

// Cuantas veces se aplica el algoritmo de hashing a la password
const SALT_ROUNDS = 10

export async function createUser(data: CreateUserDTO) {
    const existingUser = await prisma.user.findUnique({
            where: { email: data.email }
    })

    if (existingUser) {
        throw new Error('Ya existe un usuario registrado con ese email')
    }

    // Si el rol es sub-broker, debe tener un brokerId válido
    if (data.role === Role.SUB_BROKER && !data.brokerId) {
        throw new Error('Un sub-broker debe tener un broker asignado')
    }

    // Verifica que el brokerId exista en la base de datos
    if (data.brokerId) {
        const broker = await prisma.user.findUnique({
            where: {id: data.brokerId}
        })

        if (!broker || broker.role !== Role.BROKER) {
            throw new Error('El broker asignado no existe o no es valido')
        }
    }

    // Hash a la password antes de guardarla en la base de datos
    const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS)

    // Crea el usuario en la base de datos
    const user = await prisma.user.create({
        data: {
            email: data.email,
            password: hashedPassword,
            nombre: data.nombre,
            role: data.role,
            brokerId: data.brokerId ?? null
        }
    })

    // Retorna el usuario sin la password
    const {password, ...userWithoutPassword} = user
    return userWithoutPassword
}

export async function login(data: LoginDTO): Promise<AuthResponse> {
    const user = await prisma.user.findUnique({
            where: { email: data.email }
        })

        if(!user){
            throw new Error('Credenciales inválidas')
        }

        // Compara la password ingresada con el hash almacenado en la base de datos
        const isPasswordValid = await bcrypt.compare(data.password, user.password)

        if(!isPasswordValid){
            throw new Error('Credenciales inválidas')
        }

        // Crea el payload del JWT con los datos necesarios
        const payload: JwtPayload = {
            userId: user.id,
            email: user.email,
            role: user.role,
            brokerId: user.brokerId
        }

        // Firma el token con la clave secreta del .env
        // El token expira en 7 dias (lo podemos cambiar a lo que queramos)
        const accessToken = jwt.sign(
            payload,
            process.env.JWT_SECRET as string,
            {expiresIn: '7d'}
        )

        return {
            accessToken,
            user: {
                id: user.id,
                email: user.email,
                nombre: user.nombre,
                role: user.role,
                brokerId: user.brokerId
            }
        }
}
