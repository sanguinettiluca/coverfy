import crypto from "crypto"

const ALGORITHM = "aes-256-gcm"
const IV_LENGTH = 12

function getKey(): Buffer {
    const rawKey = process.env.ENCRYPTION_KEY

    if(!rawKey){
        throw new Error("ENCRYPTION_KEY no esta configurada en las variables de entorno")
    }

    const key = Buffer.from(rawKey, "hex")

    if(key.length !== 32){
        throw new Error("ENCRYPTION_KEY debe ser una cadena hexadecimal de 64 caracteres")
    }

    return key
}

export function encrypt(texto: string): string {
    const key = getKey()
    const iv = crypto.randomBytes(IV_LENGTH)
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv)

    const cifrado = Buffer.concat([cipher.update(texto, "utf8"), cipher.final()])
    const authTag = cipher.getAuthTag()

    return `${iv.toString("hex")}:${authTag.toString("hex")}:${cifrado.toString("hex")}`
}

export function decrypt(textoCifrado: string): string{
    const key = getKey()
    const partes = textoCifrado.split(":")

    if(partes.length !== 3){
        throw new Error("Formato de dato cifrado invalido")
    }

    const [ivHex, authTagHex, datosHex] = partes
    const iv = Buffer.from(ivHex, "hex")
    const authTag = Buffer.from(authTagHex, "hex")
    const datos = Buffer.from(datosHex, "hex")

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
    decipher.setAuthTag(authTag)

    const descifrado = Buffer.concat([ decipher.update(datos), decipher.final() ])
    return descifrado.toString("utf8")
}