import { useState } from 'react'
import type { ChangeEvent } from 'react'
import * as Tesseract from 'tesseract.js'

interface ClienteForm {
  documento: string
  nombres: string
  apellidos: string
  fechaNacimiento: string
}

const initialForm: ClienteForm = {
  documento: '',
  nombres: '',
  apellidos: '',
  fechaNacimiento: ''
}

type ParseResult = { data: Partial<ClienteForm>; sources: Record<string, string> }

const parseCedulaText = (text: string): ParseResult => {
  const cleanLine = (value: string) =>
    value
      .replace(/[\u2018\u2019\u201A\u201B]/g, "'")
      .replace(/[\u201C\u201D\u201E]/g, '"')
      .replace(/[\u2013\u2014‐‑‒–—−]/g, '-')
      .replace(/[•·]/g, ' ')
      .replace(/\|/g, 'I')
      .replace(/[^\S\u00A0\p{L}\d\-\/ :.,@]/gu, ' ')
      .replace(/\s+/g, ' ')
      .trim()

  const lines = text
    .split(/\r?\n/)
    .map((line) => cleanLine(line))
    .filter((line) => line.length > 0)

  const result: Partial<ClienteForm> = {}
  const sources: Record<string, string> = {}

  const documentoLabel = /\b(?:ci|c[\.\s]*i|cedula|c[eé]dula|documento|dni|ruc|n(?:º|°)?\b|n[\W]*de[\W]*ident)/i
  const documentoRegex = /(?:\d{1,3}(?:[\.\s]\d{3}){2}-\d|\d{7,8}-\d|\d{7,9})/
  const dateLabel = /\b(?:fecha.*nac|nacimiento|f\.nac|fecnac|fnac|fecha de nacimiento|date.*birth|dob)\b/i
  const dateRegex = /(\d{2}[\/\-.]\d{2}[\/\-.]\d{4})/

const labelNames =
  /\b(?:nombre(?:s)?|nome(?:s)?|name(?:s)?)\b/gi
 const labelApellidos =
  /\b(?:apellido(?:s)?|sobrenome(?:s)?|surname(?:s)?)\b/gi
  const labelDireccion = /\b(?:direcci[oó]n|domicilio|direccion|address)\b/i

  const cleanDocumento = (value: string) => value.replace(/[^\d]/g, '')
  const normalizeDigits = (value: string) =>
    value
      .replace(/[Oo]/g, '0')
      .replace(/[Il\|l]/g, '1')
      .replace(/[Ss]/g, '5')
      .replace(/[Z]/g, '2')
      .replace(/[Bb]/g, '8')

const extractLabelValue = (
  line: string,
  label: RegExp
) => {

  const cleaned = line
    .replace(label, '')
    .replace(/^[\s:\-\/|]+/, '')

  return cleaned.trim()
}

  const extractName = (value: string) => {
    const cleaned = value
      .normalize('NFKC')
      .replace(/[\d@#$%^&*_=+\[\]{}<>|\\/~`]+/g, ' ')
      .replace(/\b(?:nombre(?:s)?|nome(?:s)?|name(?:s)?|apellido(?:s)?|sobrenom(?:e|es)?|sobrenome|surname|nacionalidad|nacionalidade|identidad|identidade|fecha|nacimiento|expedicion|vencimiento|documento|cedula|ci|dni|ruc|numero|nº|n°|n\*?)\b/gi, ' ')
      .replace(/[:\/\-|]+/g, ' ')
      .replace(/[^\p{L}\s\-']/gu, ' ')
      .replace(/\s+/g, ' ')
      .trim()

    return cleaned
  }

  const normalizeLabel = (s: string) =>
    s
      .toLowerCase()
      .replace(/[^\p{L}\d]+/gu, ' ')
      .replace(/(.)\1+/g, '$1')
      .replace(/\s+/g, ' ')
      .trim()

  const findDate = (line: string) => {
    const cleaned = normalizeDigits(line)
    const found = cleaned.match(dateRegex)
    if (found) {
      return found[1].replace(/\./g, '/').replace(/-/g, '/')
    }
    const compact = cleaned.match(/\b(\d{2})(\d{2})(\d{4})\b/)
    if (compact) {
      return `${compact[1]}/${compact[2]}/${compact[3]}`
    }
    return ''
  }

  const isAnyLabel = (line: string) => {
    const lower = normalizeLabel(line)
    return (
      documentoLabel.test(lower) ||
      labelNames.test(lower) ||
      labelApellidos.test(lower) ||
      labelDireccion.test(lower) ||
      dateLabel.test(lower)
    )
  }

  const findNextValueLine = (startIdx: number) => {
    for (let j = startIdx + 1; j < lines.length; j++) {
      const cand = lines[j].trim()
      if (!cand) continue
      if (!isAnyLabel(cand)) return { value: cand, index: j }
      const afterColon = cand.replace(/^.*?:\s*/, '')
      if (afterColon && !/^(:|-)+$/.test(afterColon)) return { value: afterColon, index: j }
    }
    return null
  }

  const potentialNameLines: string[] = []

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i]
    const line = rawLine.trim()
    const lower = line.toLowerCase()
    const lowerNormalized = normalizeLabel(lower)

    // Documento label -> value on same or next non-label line
    if (!result.documento && documentoLabel.test(lowerNormalized)) {
      const found = line.match(documentoRegex) || (line ? line.match(/\d{5,}/) : null)
      if (found) {
        // clean common noisy characters around the number
        const raw = found[0].replace(/[^\d.\-]/g, '')
        result.documento = cleanDocumento(raw)
        sources.documento = line
        continue
      }

      const digitsOnlyLine = line.replace(/[^\d]/g, '')
      if (digitsOnlyLine.length >= 5 && digitsOnlyLine.length <= 9) {
        result.documento = cleanDocumento(digitsOnlyLine)
        sources.documento = line
        continue
      }

      const next = findNextValueLine(i)
      if (next) {
        const digitsOnly = next.value.replace(/[^\d]/g, '')
        if (digitsOnly.length >= 5 && digitsOnly.length <= 9) {
          result.documento = cleanDocumento(digitsOnly)
          sources.documento = next.value
          i = next.index
          continue
        }
        if (documentoRegex.test(next.value)) {
          const raw = next.value.match(documentoRegex)![0].replace(/[^\d.\-]/g, '')
          result.documento = cleanDocumento(raw)
          sources.documento = next.value
          i = next.index
          continue
        }
      }
    }

    if (!result.apellidos && labelApellidos.test(lowerNormalized)) {
      const extracted = extractLabelValue(line, labelApellidos)
      if (extracted) {
        result.apellidos = extractName(extracted)
        sources.apellidos = extracted
        continue
      }
      const next = findNextValueLine(i)
      if (next) {
        result.apellidos = extractName(next.value)
        sources.apellidos = next.value
        i = next.index
        continue
      }
    }

    // Nombres label
    if (!result.nombres && labelNames.test(lowerNormalized)) {
      const extracted = extractLabelValue(line, labelNames)
      if (extracted) {
        result.nombres = extractName(extracted)
        sources.nombres = extracted
        continue
      }
      const next = findNextValueLine(i)
      if (next) {
        result.nombres = extractName(next.value)
        sources.nombres = next.value
        i = next.index
        continue
      }
    }

    // Fecha label
    if (!result.fechaNacimiento && dateLabel.test(lowerNormalized)) {
      const d = findDate(line)
      if (d) {
        result.fechaNacimiento = d
        sources.fechaNacimiento = line
        continue
      }
      const next = findNextValueLine(i)
      if (next) {
        const d2 = findDate(next.value)
        if (d2) {
          result.fechaNacimiento = d2
          sources.fechaNacimiento = next.value
          i = next.index
          continue
        }
      }
    }

    // Aggressive next-line capture for apellido/nombre/identidad labels
    if (!result.apellidos && /apellido|sobrenom|sobrenome|surname/i.test(lower)) {
      const next = findNextValueLine(i)
      if (next) {
        result.apellidos = extractName(next.value)
        sources.apellidos = next.value
        i = next.index
        continue
      }
    }

    if (!result.nombres && /nombre|nome|name/i.test(lower)) {
      const next = findNextValueLine(i)
      if (next) {
        result.nombres = extractName(next.value)
        sources.nombres = next.value
        i = next.index
        continue
      }
    }

    if (!result.documento && /identid|n\*?|n\b|nº|n°|identidad|n de ident|n de identidad/i.test(lower)) {
      const next = findNextValueLine(i)
      if (next) {
        const digitsOnly = next.value.replace(/[^\d]/g, '')
        if (digitsOnly.length >= 5 && digitsOnly.length <= 9) {
          result.documento = cleanDocumento(digitsOnly)
          sources.documento = next.value
          i = next.index
          continue
        }
      }
    }

    // fallback: direct document anywhere (allow noisy chars)
    if (!result.documento) {
      const digitsOnlyAnywhere = line.replace(/[^\d]/g, '')
      if (digitsOnlyAnywhere.length >= 5 && digitsOnlyAnywhere.length <= 9) {
        result.documento = cleanDocumento(digitsOnlyAnywhere)
        sources.documento = line
        continue
      }
      const candidate = line.replace(/[^\d.\-\s]/g, ' ')
      const foundDoc = candidate.match(documentoRegex) || candidate.match(/\d{5,9}/)
      if (foundDoc) {
        const raw = foundDoc[0].replace(/[^\d.\-]/g, '')
        result.documento = cleanDocumento(raw)
        sources.documento = line
        continue
      }
    }

    if (!isAnyLabel(line) && !/\d/.test(line) && line.split(' ').length >= 2) {
      // skip obvious label-like lines (contain slash or the token ' /') which OCR often leaves
      if (line.includes('/') || line.includes('|') || /\b(n\b|nº|n°|n\*|de\s+ident)/i.test(line)) {
        continue
      }
      potentialNameLines.push(line)
    }
  }

  // fallback global date scan
  if (!result.fechaNacimiento) {
    for (const l of lines) {
      const d = findDate(l)
      if (d) {
        result.fechaNacimiento = d
        sources.fechaNacimiento = l
        break
      }
    }
  }

  // fallback for names
  if (!result.nombres || !result.apellidos) {
    const nameLine = potentialNameLines.find((l) => l.length > 3) || ''
    if (nameLine) {
      const normalized = extractName(nameLine.replace(/,\s*/g, ' '))
      const words = normalized.split(' ').filter(Boolean)
      if (words.length >= 3) {
        if (!result.nombres) result.nombres = `${words[0]} ${words[1]}`
        if (!result.apellidos) result.apellidos = words.slice(2).join(' ')
        sources.nombres = nameLine
        sources.apellidos = nameLine
      } else if (words.length === 2) {
        if (!result.nombres) result.nombres = words[0]
        if (!result.apellidos) result.apellidos = words[1]
        sources.nombres = nameLine
        sources.apellidos = nameLine
      } else if (words.length === 1) {
        if (!result.nombres) result.nombres = words[0]
        sources.nombres = nameLine
      }
    }
  }

  return { data: result, sources }
}

export default function OcrCedulaForm() {
  const [form, setForm] = useState<ClienteForm>(initialForm)
  const [sources, setSources] = useState<Record<string, string>>({})
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [ocrText, setOcrText] = useState<string>('')
  const [status, setStatus] = useState<string>('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setOcrText('')
    setStatus('Imagen cargada. Listo para analizar.')
    setForm(initialForm)
    const url = URL.createObjectURL(file)
    setImageUrl(url)
  }

  const handleAnalyze = async () => {
    if (!imageUrl) {
      setStatus('Selecciona primero una imagen de cédula.')
      return
    }

    setIsAnalyzing(true)
    setStatus('Analizando cedula...')

    try {
      const worker = await Tesseract.createWorker('spa', undefined, {
        logger: (m: { status: string; progress?: number }) => {
          if (m.status === 'recognizing text') {
            setStatus(`Analizando: ${Math.round((m.progress ?? 0) * 100)}%`)
          }
        },
      })

      await worker.load()
      await worker.reinitialize('spa')
      const result: Tesseract.RecognizeResult = await worker.recognize(imageUrl)
      const parsed = parseCedulaText(result.data.text)

      setOcrText(result.data.text)
      setForm((current) => ({ ...current, ...parsed.data }))
      setSources(parsed.sources)
      setStatus('OCR completado. Revisa y ajusta los datos antes de guardar.')
      await worker.terminate()
    } catch (error) {
      setStatus('Error al analizar la imagen. Verifica el archivo y vuelve a intentar.')
      console.error(error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleInputChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  return (
    <section className="ocr-form">
      <h1>OCR de cédula</h1>
      <p>Sube una imagen de la cédula para que la app reconozca y complete automáticamente los campos.</p>

      <div className="ocr-grid">
        <div className="ocr-panel">
          <label className="file-label">
            Selecciona imagen de la cédula
            <input type="file" accept="image/*" onChange={handleFileChange} />
          </label>
          <button type="button" onClick={handleAnalyze} disabled={isAnalyzing || !imageUrl}>
            {isAnalyzing ? 'Analizando...' : 'Analizar cédula'}
          </button>
          <p className="status">{status}</p>

          {imageUrl && <img className="preview" src={imageUrl} alt="Vista previa de cédula" />}
        </div>

        <div className="ocr-panel">
          <div className="field-row">
            <label>Documento</label>
            <input value={form.documento} name="documento" onChange={handleInputChange} />
            <div className="field-source">Fuente: {sources.documento || '-'}</div>
          </div>
          <div className="field-row">
            <label>Nombres</label>
            <input value={form.nombres} name="nombres" onChange={handleInputChange} />
            <div className="field-source">Fuente: {sources.nombres || '-'}</div>
          </div>
          <div className="field-row">
            <label>Apellidos</label>
            <input value={form.apellidos} name="apellidos" onChange={handleInputChange} />
            <div className="field-source">Fuente: {sources.apellidos || '-'}</div>
          </div>
          <div className="field-row">
            <label>Fecha de nacimiento</label>
            <input value={form.fechaNacimiento} name="fechaNacimiento" onChange={handleInputChange} />
            <div className="field-source">Fuente: {sources.fechaNacimiento || '-'}</div>
          </div>
        </div>
      </div>

      <section className="ocr-text">
        <h2>Texto reconocido</h2>
        <pre>{ocrText || 'El texto reconocido aparecerá aquí luego del análisis.'}</pre>
      </section>
    </section>
  )
}
