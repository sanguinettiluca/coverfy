import Tesseract from "tesseract.js";

export interface DatosCedula{
    nombres?: string;
    apellidos?: string;
    documento?: string;
    fechaNacimiento?: string;
}

export async function extraerDatosCedula(buffer: Buffer, mimetype: string): Promise<DatosCedula> {
    const {data} = await Tesseract.recognize(buffer, "spa", {
        logger: () => {}
    });

    const texto = data.text;
    const resultado: DatosCedula = {};

    const matchDocumento = texto.match(/\b(\d{1,3}[\.\s]?\d{3}[\.\s]?\d{3}[-\s]?\d)\b/);
    if(matchDocumento){
        // Normaliza a solo digitos
        resultado.documento = matchDocumento[1].replace(/[\.\s\-]/g, "");
    }

    // Fecha: DD/MM/YYYY
    const matchFecha = texto.match(/\b(\d{2})[\/\-\.](\d{2})[\/\-\.](\d{4})\b/);
    if(matchFecha){
        resultado.fechaNacimiento = `${matchFecha[1]}/${matchFecha[2]}/${matchFecha[3]}`;
    }

    const lineas = texto.split("\n").map( (l) => l.trim() ).filter(Boolean);
    for(let i = 0; i < lineas.length; i++){
        const linea = lineas[i].toUpperCase();

        if(linea.includes("NOMBRE") || linea.includes("NOME")){
            const valor = linea.replace(/NOMBRES?[:\s]*/i, "").trim() || lineas[i + 1];
            if(valor && /^[A-ZÁÉÍÓÚÑ\s]+$/.test(valor)){
                resultado.nombres = capitalizar(valor);
            }
        }

        if(linea.includes("APELLIDO") || linea.includes("SOBRENOME")){
            const valor = linea.replace(/APELLIDOS?[:\s]*/i, "").trim() || lineas[i + 1];
            if(valor && /^[A-ZÁÉÍÓÚÑ\s]+$/.test(valor)){
                resultado.apellidos = capitalizar(valor);
            }
        }
    }

    return resultado;
}

function capitalizar(texto: string): string{
    return texto
    .toLowerCase()
    .split(" ")
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
}