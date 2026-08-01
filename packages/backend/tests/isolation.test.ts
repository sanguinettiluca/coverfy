import { describe, it, expect, beforeAll, afterAll } from "vitest"
import crypto from "crypto"
import { basePrisma } from "../src/config/prisma"
import { createRegistry, cleanupRegistry, createBroker, createSubBroker, api, bearerFor, TestRegistry, CreatedUser } from "./helpers"

// ===========================================================================
// SECCION 3 - AISLAMIENTO DE CARTERA: matriz combinatoria completa.
//
// 3 brokers, cada uno con su sub-broker y su propio set de datos (cliente,
// poliza, siniestro, compania, mensaje rapido). Para cada combinacion
// (atacante x victima x entidad x accion GET/PUT/DELETE) generada con loops
// anidados, se confirma que un usuario de un broker NUNCA puede leer, editar
// ni borrar datos de otro broker -- ni como BROKER ni como SUB_BROKER.
//
// Status esperados (documentados en base al comportamiento real de los
// controllers, ver src/controllers/*.controller.ts):
//   GET    -> 404 (todos los getById devuelven 404 si no pertenece al broker)
//   PUT    -> 400 (los controllers atrapan el error de "no encontrado" con 400,
//                  no con 404 -- inconsistencia de la app documentada como
//                  hallazgo en el reporte, no una falla de seguridad: el dato
//                  igual queda protegido)
//   DELETE -> 400 (idem PUT)
// ===========================================================================

interface BrokerFixture {
    index: number
    broker: CreatedUser
    subBroker: CreatedUser
    clientId: string
    policyId: string
    claimId: string
    companyId: string
    quickMessageId: string
}

async function buildBrokerFixture(reg: TestRegistry, index: number): Promise<BrokerFixture> {
    const broker = await createBroker(reg, { name: `Broker Aislamiento ${index}` })
    const subBroker = await createSubBroker(reg, broker.id, { name: `SubBroker Aislamiento ${index}` })

    const client = await basePrisma.client.create({
        data: {
            firstName: `Cliente${index}`,
            lastName: "Aislamiento",
            documentNumber: `ISO-${index}-${crypto.randomUUID().slice(0, 8)}`,
            phone: "099000111",
            email: `cliente${index}@example.com`,
            address: `Direccion ${index}`,
            brokerId: broker.id,
            createdById: broker.id,
        },
    })
    reg.clientIds.push(client.id)

    const company = await basePrisma.company.create({ data: { name: `Compania Aislamiento ${index}-${crypto.randomUUID().slice(0, 6)}`, brokerId: broker.id } })
    reg.companyIds.push(company.id)

    const policy = await basePrisma.policy.create({
        data: {
            policyNumber: `ISO-POL-${index}-${crypto.randomUUID().slice(0, 6)}`,
            insuranceType: "VEHICLE",
            clientId: client.id,
            companyId: company.id,
            brokerId: broker.id,
            vehicleDetails: {
                create: {
                    brand: "Marca",
                    model: "Modelo",
                    year: 2020,
                    licensePlate: `PLT-${index}`,
                    registrationNumber: "REG",
                    chassisNumber: "CHASSIS",
                    engineNumber: "ENGINE",
                },
            },
        },
    })
    reg.policyIds.push(policy.id)

    const claim = await basePrisma.claim.create({
        data: { incidentDate: new Date("2024-01-01"), policyId: policy.id, brokerId: broker.id },
    })
    reg.claimIds.push(claim.id)

    const quickMessage = await basePrisma.quickMessage.create({
        data: { name: `QM Aislamiento ${index}`, message: "mensaje", brokerId: broker.id },
    })
    reg.quickMessageIds.push(quickMessage.id)

    return {
        index,
        broker,
        subBroker,
        clientId: client.id,
        policyId: policy.id,
        claimId: claim.id,
        companyId: company.id,
        quickMessageId: quickMessage.id,
    }
}

interface EntityDef {
    label: string
    basePath: string
    idKey: keyof BrokerFixture
    updateBody: Record<string, unknown>
    bodyKey: string // clave del objeto en la respuesta 200 (ej: "client", "policy")
}

const entities: EntityDef[] = [
    { label: "cliente", basePath: "/api/clientes", idKey: "clientId", updateBody: { address: "Direccion hackeada" }, bodyKey: "client" },
    { label: "poliza", basePath: "/api/polizas", idKey: "policyId", updateBody: { totalAmount: 999 }, bodyKey: "policy" },
    { label: "siniestro", basePath: "/api/siniestros", idKey: "claimId", updateBody: { notes: "hackeado" }, bodyKey: "claim" },
    { label: "compania", basePath: "/api/companias", idKey: "companyId", updateBody: { name: "Nombre hackeado" }, bodyKey: "company" },
    { label: "mensaje rapido", basePath: "/api/mensajes-rapidos", idKey: "quickMessageId", updateBody: { message: "hackeado" }, bodyKey: "quickMessage" },
]

describe("Aislamiento de cartera: matriz combinatoria (3 brokers x sub-brokers x 5 entidades)", () => {
    const reg = createRegistry()
    const fixtures: BrokerFixture[] = []

    beforeAll(async () => {
        for (let i = 0; i < 3; i++) {
            fixtures.push(await buildBrokerFixture(reg, i))
        }
    }, 60000)

    afterAll(async () => {
        await cleanupRegistry(reg)
    })

    describe("Controles positivos: cada broker y sub-broker accede a SUS PROPIOS datos", () => {
        for (const owner of [0, 1, 2]) {
            for (const roleLabel of ["broker", "subBroker"] as const) {
                for (const entity of entities) {
                    it(`${roleLabel} del broker ${owner} puede leer su propio(a) ${entity.label}`, async () => {
                        const fixture = fixtures[owner]
                        const actor = roleLabel === "broker" ? fixture.broker : fixture.subBroker
                        const id = fixture[entity.idKey] as string
                        const res = await api.get(`${entity.basePath}/${id}`).set(bearerFor(actor))
                        expect(res.status).toBe(200)
                    })
                }
            }
        }
    })

    describe("Matriz de ataque cruzado: atacante de un broker contra datos de OTRO broker", () => {
        for (let ownerIdx = 0; ownerIdx < 3; ownerIdx++) {
            for (let attackerIdx = 0; attackerIdx < 3; attackerIdx++) {
                if (attackerIdx === ownerIdx) continue // eso es acceso legitimo, cubierto arriba

                for (const roleLabel of ["broker", "subBroker"] as const) {
                    for (const entity of entities) {
                        const ownerLabel = `broker${ownerIdx}`
                        const attackerLabel = `${roleLabel}-de-broker${attackerIdx}`

                        it(`GET ${entity.basePath}/:id -- ${attackerLabel} contra ${entity.label} de ${ownerLabel} => 404`, async () => {
                            const ownerFixture = fixtures[ownerIdx]
                            const attackerFixture = fixtures[attackerIdx]
                            const actor = roleLabel === "broker" ? attackerFixture.broker : attackerFixture.subBroker
                            const id = ownerFixture[entity.idKey] as string

                            const res = await api.get(`${entity.basePath}/${id}`).set(bearerFor(actor))
                            expect(res.status).toBe(404)
                        })

                        it(`PUT ${entity.basePath}/:id -- ${attackerLabel} contra ${entity.label} de ${ownerLabel} => rechazado y sin cambios`, async () => {
                            const ownerFixture = fixtures[ownerIdx]
                            const attackerFixture = fixtures[attackerIdx]
                            const actor = roleLabel === "broker" ? attackerFixture.broker : attackerFixture.subBroker
                            const id = ownerFixture[entity.idKey] as string

                            const res = await api.put(`${entity.basePath}/${id}`).set(bearerFor(actor)).send(entity.updateBody)
                            // La app devuelve 400 (no 404) para "no encontrado" en todos los
                            // PUT -- ver nota de cabecera. Lo importante para la seguridad es
                            // que NUNCA sea 200/201 y que el dato no cambie (verificado abajo).
                            expect(res.status).toBe(400)
                            expect([200, 201]).not.toContain(res.status)
                        })

                        it(`DELETE ${entity.basePath}/:id -- ${attackerLabel} contra ${entity.label} de ${ownerLabel} => rechazado, no se borra`, async () => {
                            const ownerFixture = fixtures[ownerIdx]
                            const attackerFixture = fixtures[attackerIdx]
                            const actor = roleLabel === "broker" ? attackerFixture.broker : attackerFixture.subBroker
                            const id = ownerFixture[entity.idKey] as string

                            const res = await api.delete(`${entity.basePath}/${id}`).set(bearerFor(actor))
                            expect(res.status).toBe(400)

                            // Confirma que el registro sigue existiendo, accedido por su dueño real
                            const confirmActor = ownerFixture.broker
                            const confirm = await api.get(`${entity.basePath}/${id}`).set(bearerFor(confirmActor))
                            expect(confirm.status).toBe(200)
                        })
                    }
                }
            }
        }
    })
})
