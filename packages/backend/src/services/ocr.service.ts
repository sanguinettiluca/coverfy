import Tesseract from 'tesseract.js';

export interface DatosCedula {
  nombre?: string;
  apellido?: string;
  cedula?: string;
  fechaNacimiento?: string;
}

function normalizarTexto(texto: string): string {
  return texto
    .replace(/\r/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extraerCedula(lineas: string[]): string | undefined {
  const cedulaRegexes = [
    /(?:C[ÉE]DULA|CI|CED\.?|DNI|NRO\.?|NR\.?|IDENTIDAD)\s*[:\-]?\s*([0-9.\-\s]{7,15})/i,
    /([0-9]{7,8})/,
  ];

  for (const regex of cedulaRegexes) {
    for (const linea of lineas) {
      const coincidencia = linea.match(regex);
      if (coincidencia && coincidencia[1]) {
        const digitos = coincidencia[1].replace(/[^0-9]/g, '');
        if (digitos.length >= 7 && digitos.length <= 8) {
          return digitos;
        }
      }
    }
  }

  return undefined;
}

function extraerFechaNacimiento(lineas: string[]): string | undefined {
  const fechaRegex = /(\d{1,2})[\/\.-](\d{1,2})[\/\.-](\d{2,4})/;

  for (const linea of lineas) {
    const coincidencia = linea.match(fechaRegex);
    if (coincidencia) {
      let [,, dia, mes, anio] = coincidencia;
      if (anio.length === 2) {
        anio = Number(anio) > 30 ? `19${anio}` : `20${anio}`;
      }
      return `${dia.padStart(2, '0')}/${mes.padStart(2, '0')}/${anio}`;
    }
  }

  return undefined;
}

function extraerNombreApellido(lineas: string[]): { nombre?: string; apellido?: string } {
  const lineasFiltradas = lineas.filter(linea => {
    const esCedula = /(?:C[ÉE]DULA|CI|CED\.?|DNI|NRO\.?|NR\.?|IDENTIDAD)/i.test(linea);
    const esFecha = /\d{1,2}[\/\.-]\d{1,2}[\/\.-]\d{2,4}/.test(linea);
    const tieneSoloDigitos = /^\D*$/.test(linea) === false;
    return !esCedula && !esFecha && !tieneSoloDigitos;
  });

  const candidato = lineasFiltradas.find(linea => /,/.test(linea)) || lineasFiltradas.find(linea => linea.split(/\s+/).length >= 2);
  if (!candidato) {
    return {};
  }

  if (candidato.includes(',')) {
    const partes = candidato.split(',').map(parte => parte.trim()).filter(parte => parte.length > 0);
    return {
      apellido: partes[0],
      nombre: partes.slice(1).join(' '),
    };
  }

  const palabras = candidato.split(/\s+/);
  if (palabras.length === 2) {
    return {
      nombre: palabras[0],
      apellido: palabras[1],
    };
  }

  return {
    nombre: palabras.slice(0, -1).join(' '),
    apellido: palabras.slice(-1).join(' '),
  };
}

export async function ocrService(buffer: Buffer, mimetype: string): Promise<DatosCedula> {
  try {
    const { data: { text } } = await Tesseract.recognize(buffer, 'spa');
    const textoNormalizado = normalizarTexto(text);
    const lineas = textoNormalizado.split('\n').map(linea => linea.trim()).filter(linea => linea.length > 0);

    return {
      cedula: extraerCedula(lineas),
      fechaNacimiento: extraerFechaNacimiento(lineas),
      ...extraerNombreApellido(lineas),
    };
  } catch (error) {
    return {};
  }
}

export const ocrController = ocrService;
export const extraerDatosPoliza = ocrService;
