import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import prisma from "../config/prisma"
import { CreateUserDTO, JwtPayload, LoginDTO, AuthResponse, PreAuthTokenPayload, LoginResult } from "../domain/user"
import { Role } from "../generated/prisma"
import { decrypt } from "../utils/crypto.util"
import { validatePassword } from "../validators/password.validator"
import { verificarCodigo, verificarBackupCode } from "./twoFactor.service"

// Cuantas veces se aplica el algoritmo de hashing a la password
const SALT_ROUNDS = 10

export async function createUser(data: CreateUserDTO) {
    const {valid, errors} = validatePassword(data.password)

    if(!valid){
        throw new Error(`La contraseña no es válida: ${errors.join(', ')}`)
    }

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

function generarAuthResponse(user: {
    id: string
    email: string
    nombre: string
    role: Role
    brokerId: string | null
}): AuthResponse{
    const payload: JwtPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
        brokerId: user.brokerId
    }

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

export async function login(data: LoginDTO): Promise<LoginResult> {
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

    // Si el usuario tiene el 2FA activado, cortamos aca.
    // Se emite un token temporal de 5 mins para que el fornt end complete el segundo paso
    if(user.twoFactorEnabled){
        const preAuthPayload: PreAuthTokenPayload = {
            userId: user.id,
            purpose: '2fa_pending'
        }

        const preAuthToken = jwt.sign(
            preAuthPayload,
            process.env.JWT_SECRET as string,
            {expiresIn: '5m'}
        )

        return {twoFactorRequired: true, preAuthToken}
    }

    return generarAuthResponse(user)
}

export async function verifyTwoFactorLogin(preAuthToken: string, codigo: string): Promise<AuthResponse> {
    let payload: PreAuthTokenPayload

    try{
        payload = jwt.verify(preAuthToken, process.env.JWT_SECRET as string) as PreAuthTokenPayload
    }catch{
        throw new Error('El token temporal expiro o es invalido, vuelva a iniciar sesion')
    }

    if(payload.purpose !== '2fa_pending'){
        throw new Error("Token invalido")
    }

    const user = await prisma.user.findUnique({
        where: {id: payload.userId}
    })

    if(!user || !user.twoFactorEnabled || !user.twoFactorSecret){
        throw new Error('Credenciales invalidas')
    }

    const secret = decrypt(user.twoFactorSecret)
    const codigoValido = await verificarCodigo(secret, codigo)

    if(!codigoValido){
        const indice = await verificarBackupCode(codigo, user.twoFactorBackupCodes)

        if(indice == -1){
            throw new Error('Codigo invalido')
        }

        const codigosRestantes = user.twoFactorBackupCodes.filter((_, i) => i !== indice)
        await prisma.user.update({
            where: {id: user.id},
            data: {twoFactorBackupCodes: codigosRestantes}
        })
    }

    return generarAuthResponse(user)
}

export async function logout(token: string): Promise<void> {
    await prisma.tokenBlacklist.create({
        data: {
            token
        }
    })
}
