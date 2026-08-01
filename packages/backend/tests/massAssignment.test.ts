import { describe, it, expect, beforeAll, afterAll } from "vitest"
import crypto from "crypto"
import { basePrisma } from "../src/config/prisma"
import {
    api,
    createRegistry,
    cleanupRegistry,
    createBroker,
    bearerFor,
    TestRegistry,
    CreatedUser,
} from "./helpers"

// ===========================================================================
// SECCION 2 - MASS ASSIGNMENT: matriz completa por endpoint PUT/PATCH.
//
// Para cada entidad se arma un payload que combina TODOS los campos
// prohibidos del modelo Prisma (id, brokerId, createdById/clientId/policyId/
// companyId/coverageId/insuranceType segun aplique) con valores inventados o
// tomados de un broker/entidad real AJENA (para simular un intento de
// "secuestro" de datos), en 20 combinaciones de valores por endpoint. Como
// update*Schema no declara esos campos, validate.middleware los descarta
// (stripUnknown) sin importar el valor -- el test confirma que esa garantia
// se sostiene bajo 20 valores distintos, no solo 1.
// ===========================================================================

const COMBOS = 20

function garbageValue(kind: "uuid" | "string" | "enum", foreignId?: string): unknown {
    const pool: unknown[] = [
        crypto.randomUUID(),
        "hacked-" + crypto.randomBytes(4).toString("hex"),
        12345,
        null,
    ]
    if (foreignId) pool.push(foreignId)
    return pool[Math.floor(Math.random() * pool.length)]
}

interface AttackContext {
    reg: TestRegistry
    attacker: CreatedUser
    foreignBrokerId: string
    foreignClientId: string
    foreignCompanyId: string
    foreignPolicyId: string
}

async function setupForeignData(reg: TestRegistry): Promise<{ brokerId: string; clientId: string; companyId: string; policyId: string }> {
    const foreignBroker = await createBroker(reg)
    const client = await basePrisma.client.create({
        data: {
            firstName: "Foreign",
            lastName: "Client",
            documentNumber: `FOREIGN-${crypto.randomUUID().slice(0, 8)}`,
            phone: "099000000",
            email: "foreign@example.com",
            address: "Otra direccion",
            brokerId: foreignBroker.id,
            createdById: foreignBroker.id,
        },
    })
    reg.clientIds.push(client.id)
    const company = await basePrisma.company.create({ data: { name: `Foreign Co ${crypto.randomUUID().slice(0, 8)}`, brokerId: foreignBroker.id } })
    reg.companyIds.push(company.id)
    const policy = await basePrisma.policy.create({
        data: {
            policyNumber: `FOR-${crypto.randomUUID().slice(0, 8)}`,
            insuranceType: "OTHER",
            clientId: client.id,
            companyId: company.id,
            brokerId: foreignBroker.id,
            otherDetails: { create: { description: "foreign policy" } },
        },
    })
    reg.policyIds.push(policy.id)
    return { brokerId: foreignBroker.id, clientId: client.id, companyId: company.id, policyId: policy.id }
}

describe("Mass assignment: matriz de 20 combinaciones por endpoint PUT", () => {
    const reg = createRegistry()
    let attacker: CreatedUser
    let foreign: { brokerId: string; clientId: string; companyId: string; policyId: string }

    beforeAll(async () => {
        attacker = await createBroker(reg)
        foreign = await setupForeignData(reg)
    })

    afterAll(async () => {
        await cleanupRegistry(reg)
    })

    it("PUT /api/clientes/:id descarta id/brokerId/createdById en 20 combinaciones", async () => {
        const client = await basePrisma.client.create({
            data: {
                firstName: "Victima",
                lastName: "Cliente",
                documentNumber: `VICT-${crypto.randomUUID().slice(0, 8)}`,
                phone: "099111111",
                email: "victima@example.com",
                address: "Direccion original",
                brokerId: attacker.id,
                createdById: attacker.id,
            },
        })
        reg.clientIds.push(client.id)
        const originalId = client.id
        const originalBrokerId = client.brokerId
        const originalCreatedById = client.createdById

        for (let i = 0; i < COMBOS; i++) {
            const res = await api
                .put(`/api/clientes/${client.id}`)
                .set(bearerFor(attacker))
                .send({
                    address: `Direccion actualizada intento ${i}`,
                    id: garbageValue("uuid"),
                    brokerId: garbageValue("uuid", foreign.brokerId),
                    createdById: garbageValue("uuid", foreign.brokerId),
                })
            expect(res.status).toBe(200)
            expect(res.body.client.id).toBe(originalId)
            expect(res.body.client.brokerId).toBe(originalBrokerId)
            expect(res.body.client.createdById).toBe(originalCreatedById)
        }

        const fresh = await basePrisma.client.findUniqueOrThrow({ where: { id: client.id } })
        expect(fresh.id).toBe(originalId)
        expect(fresh.brokerId).toBe(originalBrokerId)
        expect(fresh.createdById).toBe(originalCreatedById)
        expect(fresh.address).toBe(`Direccion actualizada intento ${COMBOS - 1}`)
    })

    it("PUT /api/companias/:id descarta id/brokerId en 20 combinaciones", async () => {
        const company = await basePrisma.company.create({ data: { name: `Victima Co ${crypto.randomUUID().slice(0, 8)}`, brokerId: attacker.id } })
        reg.companyIds.push(company.id)
        const originalId = company.id
        const originalBrokerId = company.brokerId

        for (let i = 0; i < COMBOS; i++) {
            const res = await api
                .put(`/api/companias/${company.id}`)
                .set(bearerFor(attacker))
                .send({
                    name: `Nombre actualizado intento ${i}`,
                    id: garbageValue("uuid"),
                    brokerId: garbageValue("uuid", foreign.brokerId),
                })
            expect(res.status).toBe(200)
            expect(res.body.company.id).toBe(originalId)
            expect(res.body.company.brokerId).toBe(originalBrokerId)
        }

        const fresh = await basePrisma.company.findUniqueOrThrow({ where: { id: company.id } })
        expect(fresh.id).toBe(originalId)
        expect(fresh.brokerId).toBe(originalBrokerId)
        expect(fresh.name).toBe(`Nombre actualizado intento ${COMBOS - 1}`)
    })

    it("PUT /api/mensajes-rapidos/:id descarta id/brokerId en 20 combinaciones", async () => {
        const qm = await basePrisma.quickMessage.create({ data: { name: "Victima QM", message: "mensaje original", brokerId: attacker.id } })
        reg.quickMessageIds.push(qm.id)
        const originalId = qm.id
        const originalBrokerId = qm.brokerId

        for (let i = 0; i < COMBOS; i++) {
            const res = await api
                .put(`/api/mensajes-rapidos/${qm.id}`)
                .set(bearerFor(attacker))
                .send({
                    message: `mensaje actualizado intento ${i}`,
                    id: garbageValue("uuid"),
                    brokerId: garbageValue("uuid", foreign.brokerId),
                })
            expect(res.status).toBe(200)
            expect(res.body.quickMessage.id).toBe(originalId)
            expect(res.body.quickMessage.brokerId).toBe(originalBrokerId)
        }

        const fresh = await basePrisma.quickMessage.findUniqueOrThrow({ where: { id: qm.id } })
        expect(fresh.id).toBe(originalId)
        expect(fresh.brokerId).toBe(originalBrokerId)
        expect(fresh.message).toBe(`mensaje actualizado intento ${COMBOS - 1}`)
    })

    it("PUT /api/polizas/:id descarta id/brokerId/clientId/companyId/coverageId/insuranceType en 20 combinaciones", async () => {
        const ownClient = await basePrisma.client.create({
            data: {
                firstName: "Duenio",
                lastName: "Poliza",
                documentNumber: `POLOWNER-${crypto.randomUUID().slice(0, 8)}`,
                phone: "099222222",
                email: "duenio@example.com",
                address: "Direccion",
                brokerId: attacker.id,
                createdById: attacker.id,
            },
        })
        reg.clientIds.push(ownClient.id)
        const ownCompany = await basePrisma.company.create({ data: { name: `Own Co ${crypto.randomUUID().slice(0, 8)}`, brokerId: attacker.id } })
        reg.companyIds.push(ownCompany.id)
        const policy = await basePrisma.policy.create({
            data: {
                policyNumber: `VICT-${crypto.randomUUID().slice(0, 8)}`,
                insuranceType: "OTHER",
                clientId: ownClient.id,
                companyId: ownCompany.id,
                brokerId: attacker.id,
                otherDetails: { create: { description: "poliza victima" } },
            },
        })
        reg.policyIds.push(policy.id)

        const originalId = policy.id
        const originalBrokerId = policy.brokerId
        const originalClientId = policy.clientId
        const originalCompanyId = policy.companyId
        const originalInsuranceType = policy.insuranceType

        for (let i = 0; i < COMBOS; i++) {
            const res = await api
                .put(`/api/polizas/${policy.id}`)
                .set(bearerFor(attacker))
                .send({
                    totalAmount: 100 + i,
                    id: garbageValue("uuid"),
                    brokerId: garbageValue("uuid", foreign.brokerId),
                    clientId: garbageValue("uuid", foreign.clientId),
                    companyId: garbageValue("uuid", foreign.companyId),
                    coverageId: garbageValue("uuid"),
                    insuranceType: "VEHICLE",
                })
            expect(res.status).toBe(200)
            expect(res.body.policy.id).toBe(originalId)
            expect(res.body.policy.brokerId).toBe(originalBrokerId)
            expect(res.body.policy.clientId).toBe(originalClientId)
            expect(res.body.policy.companyId).toBe(originalCompanyId)
            expect(res.body.policy.insuranceType).toBe(originalInsuranceType)
        }

        const fresh = await basePrisma.policy.findUniqueOrThrow({ where: { id: policy.id } })
        expect(fresh.id).toBe(originalId)
        expect(fresh.brokerId).toBe(originalBrokerId)
        expect(fresh.clientId).toBe(originalClientId)
        expect(fresh.companyId).toBe(originalCompanyId)
        expect(fresh.insuranceType).toBe(originalInsuranceType)
        expect(fresh.totalAmount).toBe(100 + COMBOS - 1)
    })

    it("PUT /api/siniestros/:id descarta id/brokerId/policyId en 20 combinaciones", async () => {
        const ownClient = await basePrisma.client.create({
            data: {
                firstName: "Duenio",
                lastName: "Siniestro",
                documentNumber: `CLAIMOWNER-${crypto.randomUUID().slice(0, 8)}`,
                phone: "099333333",
                email: "duenio2@example.com",
                address: "Direccion",
                brokerId: attacker.id,
                createdById: attacker.id,
            },
        })
        reg.clientIds.push(ownClient.id)
        const ownCompany = await basePrisma.company.create({ data: { name: `Own Co Claim ${crypto.randomUUID().slice(0, 8)}`, brokerId: attacker.id } })
        reg.companyIds.push(ownCompany.id)
        const vehiclePolicy = await basePrisma.policy.create({
            data: {
                policyNumber: `VEH-${crypto.randomUUID().slice(0, 8)}`,
                insuranceType: "VEHICLE",
                clientId: ownClient.id,
                companyId: ownCompany.id,
                brokerId: attacker.id,
                vehicleDetails: {
                    create: {
                        brand: "Toyota",
                        model: "Hilux",
                        year: 2021,
                        licensePlate: "XYZ999",
                        registrationNumber: "REG",
                        chassisNumber: "CHASSIS",
                        engineNumber: "ENGINE",
                    },
                },
            },
        })
        reg.policyIds.push(vehiclePolicy.id)
        const claim = await basePrisma.claim.create({
            data: { incidentDate: new Date("2024-01-01"), policyId: vehiclePolicy.id, brokerId: attacker.id },
        })
        reg.claimIds.push(claim.id)

        const originalId = claim.id
        const originalBrokerId = claim.brokerId
        const originalPolicyId = claim.policyId

        for (let i = 0; i < COMBOS; i++) {
            const res = await api
                .put(`/api/siniestros/${claim.id}`)
                .set(bearerFor(attacker))
                .send({
                    notes: `actualizado intento ${i}`,
                    id: garbageValue("uuid"),
                    brokerId: garbageValue("uuid", foreign.brokerId),
                    policyId: garbageValue("uuid", foreign.policyId),
                })
            expect(res.status).toBe(200)
            expect(res.body.claim.id).toBe(originalId)
            expect(res.body.claim.brokerId).toBe(originalBrokerId)
            expect(res.body.claim.policyId).toBe(originalPolicyId)
        }

        const fresh = await basePrisma.claim.findUniqueOrThrow({ where: { id: claim.id } })
        expect(fresh.id).toBe(originalId)
        expect(fresh.brokerId).toBe(originalBrokerId)
        expect(fresh.policyId).toBe(originalPolicyId)
        expect(fresh.notes).toBe(`actualizado intento ${COMBOS - 1}`)
    })
})
