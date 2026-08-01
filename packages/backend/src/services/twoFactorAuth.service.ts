import bcrypt from "bcryptjs";
import prisma from "../config/prisma";
import { encrypt, decrypt } from "../utils/crypto.util";
import {
    generateTotpSecret,
    generateQRCode,
    verifyCode,
    generateBackupCodes
} from "./twoFactor.service";

export async function generateSetup(userId: string, email: string): Promise<{qrCode: string, secret: string}> {
    const user = await prisma.user.findUnique({
        where: {id: userId}
    })

    if(!user){
        throw new Error('Usuario no encontrado')
    }

    if(user.twoFactorEnabled){
        throw new Error('El 2FA ya esta activado en esta cuenta')
    }

    const {secret, otpauthUrl} = await generateTotpSecret(email)
    const encryptedSecret = encrypt(secret)

    await prisma.user.update({
        where: {id: userId},
        data: {twoFactorSecret: encryptedSecret}
    })

    const qrCode = await generateQRCode(otpauthUrl)

    return {qrCode, secret}
}

export async function confirmSetup(userId:string, code: string): Promise<{backupCodes: string[]}> {
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
    const validCode = await verifyCode(secret, code)

    if(!validCode){
        throw new Error('Codigo invalido')
    }

    const { codesToDisplay, hashedCodes } = await generateBackupCodes()

    await prisma.user.update({
        where: {id: userId},
        data: {
            twoFactorEnabled: true,
            twoFactorBackupCodes: hashedCodes
        }
    })

    return {backupCodes: codesToDisplay}
}

export async function disable2FA(userId: string, password: string, code: string): Promise<void> {
    const user = await prisma.user.findUnique({
        where: {id: userId}
    })

    if(!user){
        throw new Error('Usuario no encontrado')
    }

    if(!user.twoFactorEnabled || !user.twoFactorSecret){
        throw new Error('El 2FA no esta activado en esta cuenta')
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)
    if(!isPasswordValid){
        throw new Error('Credenciales invalidas')
    }

    const secret = decrypt(user.twoFactorSecret)
    const validCode = await verifyCode(secret, code)
    if(!validCode){
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
