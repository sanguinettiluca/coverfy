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

export function encrypt(text: string): string {
    const key = getKey()
    const iv = crypto.randomBytes(IV_LENGTH)
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv)

    const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()])
    const authTag = cipher.getAuthTag()

    return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted.toString("hex")}`
}

export function decrypt(encryptedText: string): string{
    const key = getKey()
    const parts = encryptedText.split(":")

    if(parts.length !== 3){
        throw new Error("Formato de dato cifrado invalido")
    }

    const [ivHex, authTagHex, dataHex] = parts
    const iv = Buffer.from(ivHex, "hex")
    const authTag = Buffer.from(authTagHex, "hex")
    const data = Buffer.from(dataHex, "hex")

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
    decipher.setAuthTag(authTag)

    const decrypted = Buffer.concat([ decipher.update(data), decipher.final() ])
    return decrypted.toString("utf8")
}
