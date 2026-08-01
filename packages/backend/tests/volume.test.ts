import { describe, it, expect, beforeAll, afterAll } from "vitest"
import crypto from "crypto"
import { basePrisma } from "../src/config/prisma"
import { api, createRegistry, cleanupRegistry, createBroker, bearerFor, CreatedUser } from "./helpers"

// ===========================================================================
// SECCION 6 - VOLUMEN: >= 300 Client distribuidos entre brokers de prueba.
//
// Decision de diseno: los 300 registros se insertan con basePrisma.client.
// createMany (una sola query) en vez de 300 POST /api/clientes secuenciales.
// La base de test es un Supabase remoto compartido con un limite duro de 15
// conexiones (ver tests/setup.ts); 300 inserts HTTP secuenciales solo para
// "llenar" datos de volumen no aporta nada que createMany no aporte igual, y
// consume minutos de mas en una corrida que se repite x3 (seccion 7). Lo que
// el enunciado realmente pide medir -- buscarClientePorDocumento y el listado
// paginado -- SI se ejercita por HTTP real, con tiempos registrados abajo.
// ===========================================================================

const TOTAL_CLIENTS = 300
const DISTRIBUTION = [150, 100, 50] // suma 300, no uniforme entre 3 brokers

interface BrokerBucket {
    broker: CreatedUser
    count: number
    documentNumbers: string[]
}

export const volumeTimings: { label: string; ms: number }[] = []

function record(label: string, ms: number): void {
    volumeTimings.push({ label, ms })
}

describe("Volumen: 300 clientes distribuidos + performance de lectura", () => {
    const reg = createRegistry()
    const buckets: BrokerBucket[] = []

    beforeAll(async () => {
        for (let b = 0; b < DISTRIBUTION.length; b++) {
            const broker = await createBroker(reg, { name: `Volumen Broker ${b}` })
            const count = DISTRIBUTION[b]
            const documentNumbers: string[] = []
            const records = []
            for (let i = 0; i < count; i++) {
                const id = crypto.randomUUID()
                const documentNumber = `VOL-${b}-${i.toString().padStart(4, "0")}-${crypto.randomUUID().slice(0, 6)}`
                documentNumbers.push(documentNumber)
                reg.clientIds.push(id)
                records.push({
                    id,
                    firstName: `Cliente${i}`,
                    lastName: `Volumen${b}`,
                    documentNumber,
                    phone: "099000000",
                    email: `vol-${b}-${i}@example.com`,
                    address: `Direccion ${i}`,
                    brokerId: broker.id,
                    createdById: broker.id,
                })
            }
            await basePrisma.client.createMany({ data: records })
            buckets.push({ broker, count, documentNumbers })
        }
    }, 120000)

    afterAll(async () => {
        await cleanupRegistry(reg)
        // eslint-disable-next-line no-console
        console.error("[volumen] tiempos de respuesta registrados:\n" + volumeTimings.map((t) => `  - ${t.label}: ${t.ms}ms`).join("\n"))
    })

    it(`crea >= ${TOTAL_CLIENTS} clientes distribuidos entre 3 brokers`, async () => {
        const total = buckets.reduce((acc, b) => acc + b.count, 0)
        expect(total).toBeGreaterThanOrEqual(TOTAL_CLIENTS)
        for (const bucket of buckets) {
            const count = await basePrisma.client.count({ where: { brokerId: bucket.broker.id } })
            expect(count).toBe(bucket.count)
        }
    })

    it("buscarClientePorDocumento responde correctamente y en tiempo razonable (10 muestras)", async () => {
        const bucket = buckets[0] // 150 clientes
        const sampleIndexes = [0, 10, 37, 74, 99, 120, 149, 5, 60, 88]
        for (const idx of sampleIndexes) {
            const documentNumber = bucket.documentNumbers[idx]
            const res = await api_get_documento(bucket.broker, documentNumber)
            record(`GET /clientes/documento/:doc (idx=${idx})`, res.responseTimeMs)
            expect(res.status).toBe(200)
            expect(res.body.documentNumber).toBe(documentNumber)
            expect(res.responseTimeMs).toBeLessThan(5000)
        }
    })

    it("el listado paginado responde correctamente y en tiempo razonable (3 paginas x 50)", async () => {
        const bucket = buckets[0] // 150 clientes
        const perPage = 50
        const seenIds = new Set<string>()
        for (let page = 1; page <= 3; page++) {
            const res = await api_list(bucket.broker, page, perPage)
            record(`GET /clientes?page=${page}&perPage=${perPage}`, res.responseTimeMs)
            expect(res.status).toBe(200)
            expect(res.body.total).toBe(150)
            expect(res.body.totalPages).toBe(3)
            expect(res.body.clients).toHaveLength(perPage)
            expect(res.responseTimeMs).toBeLessThan(5000)
            for (const c of res.body.clients) seenIds.add(c.id)
        }
        expect(seenIds.size).toBe(150) // sin duplicados ni faltantes entre paginas

        // Broker con 100 y broker con 50: confirma aislamiento y paginacion en ambos
        const bucket2 = buckets[1]
        const res2 = await api_list(bucket2.broker, 1, 200)
        record("GET /clientes?perPage=200 (broker de 100)", res2.responseTimeMs)
        expect(res2.body.total).toBe(100)
        expect(res2.body.clients).toHaveLength(100)

        const bucket3 = buckets[2]
        const res3 = await api_list(bucket3.broker, 1, 200)
        record("GET /clientes?perPage=200 (broker de 50)", res3.responseTimeMs)
        expect(res3.body.total).toBe(50)
        expect(res3.body.clients).toHaveLength(50)
    })

    it("busqueda por texto (search) sobre 150 clientes responde en tiempo razonable", async () => {
        const bucket = buckets[0]
        const res = await api_search(bucket.broker, "Cliente37")
        record("GET /clientes?search=Cliente37", res.responseTimeMs)
        expect(res.status).toBe(200)
        expect(res.body.total).toBeGreaterThanOrEqual(1)
        expect(res.responseTimeMs).toBeLessThan(5000)
    })
})

// Helpers locales que devuelven ademas el tiempo de respuesta medido con Date.now()
// justo alrededor de la llamada real a supertest.
async function api_get_documento(broker: CreatedUser, documentNumber: string) {
    const start = Date.now()
    const res = await api.get(`/api/clientes/documento/${documentNumber}`).set(bearerFor(broker))
    return Object.assign(res, { responseTimeMs: Date.now() - start })
}

async function api_list(broker: CreatedUser, page: number, perPage: number) {
    const start = Date.now()
    const res = await api.get(`/api/clientes?page=${page}&perPage=${perPage}`).set(bearerFor(broker))
    return Object.assign(res, { responseTimeMs: Date.now() - start })
}

async function api_search(broker: CreatedUser, search: string) {
    const start = Date.now()
    const res = await api.get(`/api/clientes?search=${encodeURIComponent(search)}`).set(bearerFor(broker))
    return Object.assign(res, { responseTimeMs: Date.now() - start })
}
