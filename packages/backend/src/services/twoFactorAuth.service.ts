import bcrypt from "bcryptjs";
import prisma from "../config/prisma";
import { encrypt, decrypt } from "../utils/crypto.util";
import { 
    generarSecret,
    generarQRCode,
    verificarCodigo,
    generarBackupCodes
} from "./twoFactor.service";

export async function generarSetup(userId: string, email: string): Promise<{qrCode: string, secret: string}> {
    const user = await prisma.user.findUnique({
        where: {id: userId}
    })

    if(!user){
        throw new Error('Usuario no encontrado')
    }

    if(user.twoFactorEnabled){
        throw new Error('El 2FA ya esta activado en esta cuenta')
    }

    const {secret, otpauthUrl} = await generarSecret(email)
    const secretCifrado = encrypt(secret)

    await prisma.user.update({
        where: {id: userId},
        data: {twoFactorSecret: secretCifrado}
    })

    const qrCode = await generarQRCode(otpauthUrl)

    return {qrCode, secret}
}

export async function confirmarSetup(userId:string, codigo: string): Promise<{backupCodes: string[]}> {
    const user = await prisma.user.findUnique({
        where: {id: userId}
    })

    if(!user || !user.twoFactorSecret){
        throw new Error('Primero se debe iniciar la configruacion del 2FA')
    }

    if(user.twoFactorEnabled){
        throw new Error('El 2FA ya esta activado en esta cuenta')
    }

    const secret = decrypt(user.twoFactorSecret)
    const codigoValido = await verificarCodigo(secret, codigo)

    if(!codigoValido){
        throw new Error('Codigo invalido')
    }

    const { codigosParaMostrar, codigosHasheados } = await generarBackupCodes()

    await prisma.user.update({
        where: {id: userId},
        data: {
            twoFactorEnabled: true,
            twoFactorBackupCodes: codigosHasheados
        }
    })
    
    return {backupCodes: codigosParaMostrar}
}

export async function desactivar2FA(userId: string, password: string, codigo: string): Promise<void> {
    const user = await prisma.user.findUnique({
        where: {id: userId}
    })
    
    if(!user){
        throw new Error('Usuario no encontrado')
    }

    if(!user.twoFactorEnabled || !user.twoFactorSecret){
        throw new Error('El 2FA no esta activado en esta cuenta')
    }

    const passwordValida = await bcrypt.compare(password, user.password)
    if(!passwordValida){
        throw new Error('Credenciales invalidas')
    }

    const secret = decrypt(user.twoFactorSecret)
    const codigoValido = await verificarCodigo(secret, codigo)
    if(!codigoValido){
        throw new Error('Codigo invalido')
    }

    await prisma.user.update({
        where: {id: userId},
        data: {
            twoFactorEnabled: false,
            twoFactorSecret: null,
            twoFactorBackupCodes: []
        }
    })
}