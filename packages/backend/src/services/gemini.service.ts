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
                `.trim()

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
