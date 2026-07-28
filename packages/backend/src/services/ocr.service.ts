import Tesseract from "tesseract.js";

export interface IdCardData{
    firstName?: string;
    lastName?: string;
    documentNumber?: string;
    dateOfBirth?: string;
}

export async function extractIdCardData(buffer: Buffer, mimetype: string): Promise<IdCardData> {
    const {data} = await Tesseract.recognize(buffer, "spa", {
        logger: () => {}
    });

    const text = data.text;
    const result: IdCardData = {};

    const documentMatch = text.match(/\b(\d{1,3}[\.\s]?\d{3}[\.\s]?\d{3}[-\s]?\d)\b/);
    if(documentMatch){
        // Normaliza a solo digitos
        result.documentNumber = documentMatch[1].replace(/[\.\s\-]/g, "");
    }

    // Fecha: DD/MM/YYYY
    const dateMatch = text.match(/\b(\d{2})[\/\-\.](\d{2})[\/\-\.](\d{4})\b/);
    if(dateMatch){
        result.dateOfBirth = `${dateMatch[1]}/${dateMatch[2]}/${dateMatch[3]}`;
    }

    const lines = text.split("\n").map( (l) => l.trim() ).filter(Boolean);
    for(let i = 0; i < lines.length; i++){
        const line = lines[i].toUpperCase();

        if(line.includes("NOMBRE") || line.includes("NOME")){
            const value = line.replace(/NOMBRES?[:\s]*/i, "").trim() || lines[i + 1];
            if(value && /^[A-ZÁÉÍÓÚÑ\s]+$/.test(value)){
                result.firstName = capitalize(value);
            }
        }

        if(line.includes("APELLIDO") || line.includes("SOBRENOME")){
            const value = line.replace(/APELLIDOS?[:\s]*/i, "").trim() || lines[i + 1];
            if(value && /^[A-ZÁÉÍÓÚÑ\s]+$/.test(value)){
                result.lastName = capitalize(value);
            }
        }
    }

    return result;
}

function capitalize(text: string): string{
    return text
    .toLowerCase()
    .split(" ")
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
}
