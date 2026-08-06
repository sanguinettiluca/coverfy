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

// OCR (YA NO SE USA, SE DEJA POR LAS DUDAS)

// interface ClienteForm {
//   documento: string
//   nombres: string
//   apellidos: string
//   fechaNacimiento: string
// }

// type ParseResult = { data: Partial<ClienteForm>; sources: Record<string, string> }

// const documentoLabel = /\b(?:ci|c[\.\s]*i|cedula|c[eé]dula|documento|dni|ruc|n(?:º|°)?\b|n[\W]*de[\W]*ident)/i
// const documentoRegex = /(?:\d{1,3}(?:[\.\s]\d{3}){2}-\d|\d{7,8}-\d|\d{7,9})/
// const dateLabel = /\b(?:fecha.*nac|nacimiento|f\.nac|fecnac|fnac|fecha de nacimiento|date.*birth|dob)\b/i
// const dateRegex = /(\d{2}[\/\-.]\d{2}[\/\-.]\d{4})/
// const labelNames =/\b(?:nombre(?:s)?|nome(?:s)?|name(?:s)?)\b/i
// const labelApellidos =/\b(?:apellido(?:s)?|sobrenome(?:s)?|surname(?:s)?)\b/i



// const parseCedulaText = (text: string): ParseResult => {
//   const cleanLine = (value: string) =>
//     value
//       .replace(/[\u2018\u2019\u201A\u201B]/g, "'")
//       .replace(/[\u201C\u201D\u201E]/g, '"')
//       .replace(/[\u2013\u2014‐‑‒–—−]/g, '-')
//       .replace(/[•·]/g, ' ')
//       .replace(/\|/g, 'I')
//       .replace(/[^\S\u00A0\p{L}\d\-\/ :.,@]/gu, ' ')
//       .replace(/\s+/g, ' ')
//       .trim()

//     const lines = text
//         .split(/\r?\n/)
//         .map((line) => cleanLine(line))
//         .filter((line) => line.length > 0)

//     const result: Partial<ClienteForm> = {}
//     const sources: Record<string, string> = {}

//     const cleanDocumento = (value: string) => value.replace(/[^\d]/g, '')
//     const normalizeDigits = (value: string) => value
//         .replace(/[Oo]/g, '0')
//         .replace(/[Il\|l]/g, '1')
//         .replace(/[Ss]/g, '5')
//         .replace(/[Z]/g, '2')
//         .replace(/[Bb]/g, '8')

//     const extractLabelValue = (
//     line: string,
//     label: RegExp
//     ) => {

//     const cleaned = line
//     .replace(label, '')
//     .replace(/^[\s:\-\/|]+/, '')

//     return cleaned.trim()
//     }

//   const extractName = (value: string) => {
//     const cleaned = value
//       .normalize('NFKC')
//       .replace(/[\d@#$%^&*_=+\[\]{}<>|\\/~`]+/g, ' ')
//       .replace(/\b(?:nombre(?:s)?|nome(?:s)?|name(?:s)?|apellido(?:s)?|sobrenom(?:e|es)?|sobrenome|surname|nacionalidad|nacionalidade|identidad|identidade|fecha|nacimiento|expedicion|vencimiento|documento|cedula|ci|dni|ruc|numero|nº|n°|n\*?)\b/gi, ' ')
//       .replace(/[:\/\-|]+/g, ' ')
//       .replace(/[^\p{L}\s\-']/gu, ' ')
//       .replace(/\s+/g, ' ')
//       .trim()

//     return cleaned
//   }

//   const normalizeLabel = (s: string) =>
//     s
//       .toLowerCase()
//       .replace(/[^\p{L}\d]+/gu, ' ')
//       .replace(/(.)\1+/g, '$1')
//       .replace(/\s+/g, ' ')
//       .trim()

//   const findDate = (line: string) => {
//     const cleaned = normalizeDigits(line)
//     const found = cleaned.match(dateRegex)
//     if (found) {
//       return found[1].replace(/\./g, '/').replace(/-/g, '/')
//     }
//     const compact = cleaned.match(/\b(\d{2})(\d{2})(\d{4})\b/)
//     if (compact) {
//       return `${compact[1]}/${compact[2]}/${compact[3]}`
//     }
//     return ''
//   }

//   const isAnyLabel = (line: string) => {
//     const lower = normalizeLabel(line)
//     return (
//       documentoLabel.test(lower) ||
//       labelNames.test(lower) ||
//       labelApellidos.test(lower) ||
//       dateLabel.test(lower)
//     )
//   }

//   const findNextValueLine = (startIdx: number) => {
//     for (let j = startIdx + 1; j < lines.length; j++) {
//       const cand = lines[j].trim()
//       if (!cand) continue
//       if (!isAnyLabel(cand)) return { value: cand, index: j }
//       const afterColon = cand.replace(/^.*?:\s*/, '')
//       if (afterColon && !/^(:|-)+$/.test(afterColon)) return { value: afterColon, index: j }
//     }
//     return null
//   }

//   const potentialNameLines: string[] = []

//   for (let i = 0; i < lines.length; i++) {
//     const rawLine = lines[i]
//     const line = rawLine.trim()
//     const lower = line.toLowerCase()
//     const lowerNormalized = normalizeLabel(lower)

//     // Documento label -> value on same or next non-label line
//     if (!result.documento && documentoLabel.test(lowerNormalized)) {
//       const found = line.match(documentoRegex) || (line ? line.match(/\d{5,}/) : null)
//       if (found) {
//         // clean common noisy characters around the number
//         const raw = found[0].replace(/[^\d.\-]/g, '')
//         result.documento = cleanDocumento(raw)
//         sources.documento = line
//         continue
//       }

//       const digitsOnlyLine = line.replace(/[^\d]/g, '')
//       if (digitsOnlyLine.length >= 5 && digitsOnlyLine.length <= 9) {
//         result.documento = cleanDocumento(digitsOnlyLine)
//         sources.documento = line
//         continue
//       }

//       const next = findNextValueLine(i)
//       if (next) {
//         const digitsOnly = next.value.replace(/[^\d]/g, '')
//         if (digitsOnly.length >= 5 && digitsOnly.length <= 9) {
//           result.documento = cleanDocumento(digitsOnly)
//           sources.documento = next.value
//           i = next.index
//           continue
//         }
//         if (documentoRegex.test(next.value)) {
//           const raw = next.value.match(documentoRegex)![0].replace(/[^\d.\-]/g, '')
//           result.documento = cleanDocumento(raw)
//           sources.documento = next.value
//           i = next.index
//           continue
//         }
//       }
//     }

//     if (!result.apellidos && labelApellidos.test(lowerNormalized)) {
//       const extracted = extractLabelValue(line, labelApellidos)
//       if (extracted) {
//         result.apellidos = extractName(extracted)
//         sources.apellidos = extracted
//         continue
//       }
//       const next = findNextValueLine(i)
//       if (next) {
//         result.apellidos = extractName(next.value)
//         sources.apellidos = next.value
//         i = next.index
//         continue
//       }
//     }

//     // Nombres label
//     if (!result.nombres && labelNames.test(lowerNormalized)) {
//       const extracted = extractLabelValue(line, labelNames)
//       if (extracted) {
//         result.nombres = extractName(extracted)
//         sources.nombres = extracted
//         continue
//       }
//       const next = findNextValueLine(i)
//       if (next) {
//         result.nombres = extractName(next.value)
//         sources.nombres = next.value
//         i = next.index
//         continue
//       }
//     }

//     // Fecha label
//     if (!result.fechaNacimiento && dateLabel.test(lowerNormalized)) {
//       const d = findDate(line)
//       if (d) {
//         result.fechaNacimiento = d
//         sources.fechaNacimiento = line
//         continue
//       }
//       const next = findNextValueLine(i)
//       if (next) {
//         const d2 = findDate(next.value)
//         if (d2) {
//           result.fechaNacimiento = d2
//           sources.fechaNacimiento = next.value
//           i = next.index
//           continue
//         }
//       }
//     }

//     if (!result.documento && /identid|n\*?|n\b|nº|n°|identidad|n de ident|n de identidad/i.test(lower)) {
//       const next = findNextValueLine(i)
//       if (next) {
//         const digitsOnly = next.value.replace(/[^\d]/g, '')
//         if (digitsOnly.length >= 5 && digitsOnly.length <= 9) {
//           result.documento = cleanDocumento(digitsOnly)
//           sources.documento = next.value
//           i = next.index
//           continue
//         }
//       }
//     }


//     if (!result.documento) {
//       const digitsOnlyAnywhere = line.replace(/[^\d]/g, '')
//       if (digitsOnlyAnywhere.length >= 5 && digitsOnlyAnywhere.length <= 9) {
//         result.documento = cleanDocumento(digitsOnlyAnywhere)
//         sources.documento = line
//         continue
//       }
//       const candidate = line.replace(/[^\d.\-\s]/g, ' ')
//       const foundDoc = candidate.match(documentoRegex) || candidate.match(/\d{5,9}/)
//       if (foundDoc) {
//         const raw = foundDoc[0].replace(/[^\d.\-]/g, '')
//         result.documento = cleanDocumento(raw)
//         sources.documento = line
//         continue
//       }
//     }

//     if (!isAnyLabel(line) && !/\d/.test(line) && line.split(' ').length >= 2) {
//       // skip obvious label-like lines (contain slash or the token ' /') which OCR often leaves
//       if (line.includes('/') || line.includes('|') || /\b(n\b|nº|n°|n\*|de\s+ident)/i.test(line)) {
//         continue
//       }
//       potentialNameLines.push(line)
//     }
//   }


//   if (!result.fechaNacimiento) {
//     for (const l of lines) {
//       const d = findDate(l)
//       if (d) {
//         result.fechaNacimiento = d
//         sources.fechaNacimiento = l
//         break
//       }
//     }
//   }

//   // fallback for names
//   if (!result.nombres || !result.apellidos) {
//     const nameLine = potentialNameLines.find((l) => l.length > 3) || ''
//     if (nameLine) {
//       const normalized = extractName(nameLine.replace(/,\s*/g, ' '))
//       const words = normalized.split(' ').filter(Boolean)
//       if (words.length >= 3) {
//         if (!result.nombres) result.nombres = `${words[0]} ${words[1]}`
//         if (!result.apellidos) result.apellidos = words.slice(2).join(' ')
//         sources.nombres = nameLine
//         sources.apellidos = nameLine
//       } else if (words.length === 2) {
//         if (!result.nombres) result.nombres = words[0]
//         if (!result.apellidos) result.apellidos = words[1]
//         sources.nombres = nameLine
//         sources.apellidos = nameLine
//       } else if (words.length === 1) {
//         if (!result.nombres) result.nombres = words[0]
//         sources.nombres = nameLine
//       }
//     }
//   }

//     const parsed: ParseResult = {
//         data: result,
//         sources
//     }

//     return parsed
// }