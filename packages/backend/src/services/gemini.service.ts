import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY!
})

const MODEL = "gemini-flash-latest"

const PROMPT_CEDULA = `
                    Analiza esta imagen de una cédula de identidad uruguaya.

                    Extrae únicamente la siguiente información:

                    - documento
                    - nombres
                    - apellidos
                    - fechaNacimiento
                    - fechaVencimiento

                    IMPORTANTE:

                    - Devuelve EXCLUSIVAMENTE un JSON válido.
                    - No utilices Markdown.
                    - No agregues explicaciones.
                    - Si un dato no puede leerse, devuelve null.

                    Formato:

                    {
                    "documento": "",
                    "nombres": "",
                    "apellidos": "",
                    "fechaNacimiento": "",
                    }
                `.trim()

export interface DatosCedula{
    documento: string | null
    nombres: string | null
    apellidos: string | null
    fechaNacimiento: string | null
}

export async function reconocerCedula(buffer: Buffer, mimeType: string): Promise<DatosCedula>{
    const response = await ai.models.generateContent({
        model: MODEL,
        contents: [
            {
                inlineData: {
                    data: buffer.toString("base64"),
                    mimeType
                }
            },
            {text: PROMPT_CEDULA}
        ]
    })

    const textoRespuesta = response.text

    if(!textoRespuesta){
        throw new Error("Imposible reconocer datos")
    }

    const jsonLimpio = textoRespuesta.replace(/```json|```/g, "").trim()

    let datos: DatosCedula

    try{
        datos = JSON.parse(jsonLimpio)
    }catch{
        throw new Error("No se pudo interpretar la respuesta")
    }

    return datos 
}