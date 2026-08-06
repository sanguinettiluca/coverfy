import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY!
})

const PRIMARY_MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite"
const FALLBACK_MODEL = process.env.GEMINI_MODEL_FALLBACK || "gemini-flash-latest"

const ID_CARD_PROMPT = `
                    Analiza esta imagen de una cédula de identidad uruguaya.

                    Extrae únicamente la siguiente información:

                    - documentNumber
                    - firstName
                    - lastName
                    - dateOfBirth

                    IMPORTANTE:

                    - Devuelve EXCLUSIVAMENTE un JSON válido.
                    - No utilices Markdown.
                    - No agregues explicaciones.
                    - Si un dato no puede leerse, devuelve null.
                    - documentNumber debe devolver solo numeros, sin puntos ni guiones

                    Formato:

                    {
                    "documentNumber": "",
                    "firstName": "",
                    "lastName": "",
                    "dateOfBirth": "",
                    }
                `.trim();

const PROMPT_POLIZA = `
                    Analizá este documento de póliza de seguro (emitido por una aseguradora uruguaya)
                    y extraé los siguientes datos. Respondé ÚNICAMENTE con un objeto JSON válido,
                    sin texto adicional, sin markdown, sin backticks.
                    Si algún dato no es legible o no aparece en el documento, usá null para ese campo.

                    El campo insuranceType tiene que ser EXACTAMENTE uno de estos valores (en inglés,
                    tal cual están escritos, sin traducir ni modificar):
                    VEHICLE, TRIP, RENTAL, HOME, BUSINESS, LIABILITY, BOND, LIFE, OTHER

                    Guía de equivalencia para elegir insuranceType según el contenido del documento:
                    - Seguro de auto/vehículo/moto -> VEHICLE
                    - Seguro de viaje -> TRIP
                    - Seguro de alquiler -> RENTAL
                    - Seguro de hogar/vivienda -> HOME
                    - Seguro de comercio/local comercial -> BUSINESS
                    - Responsabilidad civil -> LIABILITY
                    - Fianza/garantía -> BOND
                    - Seguro de vida -> LIFE
                    - Cualquier otro tipo que no encaje en los anteriores -> OTHER

                    Formato exacto de respuesta:
                    {
                    "insuranceType": "uno de los 9 valores de arriba, o null si no se puede determinar",
                    "policyNumber": "numero de poliza tal cual aparece en el documento",
                    "startDate": "fecha de inicio de vigencia en formato YYYY-MM-DD, o null",
                    "expirationDate": "fecha de vencimiento en formato YYYY-MM-DD, o null",
                    "coverage": "descripcion breve de la cobertura contratada (texto libre), o null",
                    "totalAmount": "monto total de la poliza, SOLO el numero sin simbolo de moneda ni separadores de miles, usando punto como separador decimal (ej: 1234.56), o null"
                    }
                    `.trim();

const VALID_INSURANCE_TYPES = ["VEHICLE", "TRIP", "RENTAL", "HOME", "BUSINESS", "LIABILITY", "BOND", "LIFE", "OTHER"]

export interface PolicyDocumentData{
    insuranceType: string | null
    policyNumber: string | null
    startDate: string | null
    expirationDate: string | null
    coverage: string | null
    totalAmount: number | null
}

export interface IdCardData{
    documentNumber: string | null
    firstName: string | null
    lastName: string | null
    dateOfBirth: string | null
}

async function generateWithFallback(contents: any) {
    try {
        return await ai.models.generateContent({ model: PRIMARY_MODEL, contents })
    } catch (error: any) {
        if (error?.status === 404) {
            console.warn(`Modelo "${PRIMARY_MODEL}" no disponible, reintentando con "${FALLBACK_MODEL}"`)
            return await ai.models.generateContent({ model: FALLBACK_MODEL, contents })
        }
        throw error
    }
}

export async function recognizePolicyDocument(buffer: Buffer): Promise<PolicyDocumentData>{
    const response = await generateWithFallback([
        {
            inlineData: {
                data: buffer.toString("base64"),
                mimeType: "application/pdf"
            }
        },
        {text: PROMPT_POLIZA}
    ])

    const responseText = response.text

    if(!responseText){
        throw new Error("Imposible reconocer datos")
    }

    const cleanJson = responseText.replace(/```json|```/g, "").trim()

    let rawData: any
    try{
        rawData = JSON.parse(cleanJson)
    }catch{
        throw new Error("No se pudo interpretar la respuesta")
    }

    return normalizePolicyData(rawData)
}

export async function recognizeIdCard(buffer: Buffer, mimeType: string): Promise<IdCardData>{
    const response = await generateWithFallback([
        {
            inlineData: {
                data: buffer.toString("base64"),
                mimeType
            }
        },
        {text: ID_CARD_PROMPT}
    ])

    const responseText = response.text

    if(!responseText){
        throw new Error("Imposible reconocer datos")
    }

    const cleanJson = responseText.replace(/```json|```/g, "").trim()

    let data: IdCardData

    try{
        data = JSON.parse(cleanJson)
    }catch{
        throw new Error("No se pudo interpretar la respuesta")
    }

    return data
}

function normalizePolicyData(rawData: any): PolicyDocumentData{
    const insuranceType = typeof rawData.insuranceType === "string" && 
    VALID_INSURANCE_TYPES.includes(rawData.insuranceType) ? rawData.insuranceType : null

    return {
        insuranceType,
        policyNumber: typeof rawData.policyNumber === "string" ? rawData.policyNumber : null,
        startDate: normalizeDate(rawData.startDate),
        expirationDate: normalizeDate(rawData.expirationDate),
        coverage: typeof rawData.coverage === "string" ? rawData.coverage : null,
        totalAmount: normalizeAmount(rawData.totalAmount)
    }
}

function normalizeDate(date: unknown): string | null {
    if (typeof date !== "string") return null
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date

    const ddmmyyyy = date.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
    if (ddmmyyyy) {
        const [, day, month, year] = ddmmyyyy
        return `${year}-${month}-${day}`
    }

    return null
}

function normalizeAmount(amount: unknown): number | null {
    if (typeof amount === "number") return amount
    if (typeof amount !== "string") return null

    let cleaned = amount.replace(/[^\d.,]/g, "")

    if (cleaned.includes(",") && cleaned.includes(".")) {
        cleaned = cleaned.replace(/\./g, "").replace(",", ".")
    } else if (cleaned.includes(",")) {
        cleaned = cleaned.replace(",", ".")
    }

    const parsed = parseFloat(cleaned)
    return isNaN(parsed) ? null : parsed
}