import { describe, it, expect, afterAll } from "vitest"
import crypto from "crypto"
import { createClientSchema, updateClientSchema } from "../src/validators/client.validator"
import { createPolicySchema, updatePolicySchema } from "../src/validators/policy.validator"
import { createClaimSchema, updateClaimSchema } from "../src/validators/claim.validator"
import { createCompanySchema, updateCompanySchema } from "../src/validators/company.validator"
import { createQuickMessageSchema, updateQuickMessageSchema } from "../src/validators/quickMessage.validator"
import { verifyTwoFactorLoginSchema } from "../src/validators/auth.validator"
import { confirmSetupSchema, disable2FASchema } from "../src/validators/twoFactorAuth.validator"
import { fuzzSchemaFields, fuzzResults, FieldSpec, VALIDATE_OPTIONS } from "./fuzz.helpers"
import { api, createRegistry, cleanupRegistry, createBroker, bearerFor } from "./helpers"

// ===========================================================================
// SECCION 1 - FUZZING DE VALIDATORS (fast-check + matriz de limites)
// Ver tests/fuzz.helpers.ts para la justificacion de por que el volumen grande
// (>=60 valores/campo, seed distinto en cada corrida) se hace a nivel schema
// y no via HTTP.
// ===========================================================================

// --- 1. Cliente ------------------------------------------------------------
function validClientBase() {
    return {
        firstName: "Ana",
        lastName: "Gomez",
        documentNumber: `DOC-${crypto.randomUUID().slice(0, 8)}`,
        dateOfBirth: "1990-05-10",
        phone: "099123456",
        alternatePhone: "099654321",
        email: "ana@example.com",
        address: "Av. Siempre Viva 742",
        notes: "cliente de prueba",
    }
}

const clientCreateFields: FieldSpec[] = [
    { kind: "string", name: "firstName", min: 2, max: 100, required: true },
    { kind: "string", name: "lastName", min: 2, max: 100, required: true },
    { kind: "string", name: "documentNumber", min: 1, max: 30, required: true },
    { kind: "date", name: "dateOfBirth", required: false },
    { kind: "string", name: "phone", min: 6, max: 20, required: false },
    { kind: "string", name: "alternatePhone", min: 6, max: 20, required: false },
    { kind: "string", name: "email", min: 3, max: 200, required: false },
    { kind: "string", name: "address", min: 3, max: 200, required: false },
    { kind: "string", name: "notes", min: 0, max: 1000, required: false, allowNull: true, allowEmptyString: true },
]
fuzzSchemaFields("createClientSchema", createClientSchema, clientCreateFields, validClientBase)

const clientUpdateFields: FieldSpec[] = [
    { kind: "string", name: "firstName", min: 2, max: 100, required: false },
    { kind: "string", name: "lastName", min: 2, max: 100, required: false },
    { kind: "string", name: "documentNumber", min: 1, max: 30, required: false },
    { kind: "date", name: "dateOfBirth", required: false },
    { kind: "string", name: "phone", min: 6, max: 20, required: false },
    { kind: "string", name: "alternatePhone", min: 6, max: 20, required: false },
    { kind: "string", name: "email", min: 3, max: 200, required: false, email: true },
    { kind: "string", name: "address", min: 3, max: 200, required: false },
    { kind: "string", name: "notes", min: 0, max: 1000, required: false, allowNull: true, allowEmptyString: true },
]
fuzzSchemaFields("updateClientSchema", updateClientSchema, clientUpdateFields, validClientBase)

// --- 2. Poliza (base + 2 tipos de detalle representativos: OTHER y VEHICLE) -
function validPolicyBase(insuranceType: string = "OTHER") {
    const base: any = {
        policyNumber: `POL-${crypto.randomUUID().slice(0, 8)}`,
        referenceNumber: "REF-001",
        status: "ACTIVE",
        startDate: "2024-01-01",
        expirationDate: "2025-01-01",
        totalAmount: 1000,
        installments: 3,
        paymentMethod: "Debit",
        clientId: crypto.randomUUID(),
        companyId: crypto.randomUUID(),
        coverageId: crypto.randomUUID(),
        insuranceType,
    }
    if (insuranceType === "OTHER") base.otherDetails = { description: "detalle de prueba" }
    if (insuranceType === "VEHICLE") {
        base.vehicleDetails = {
            brand: "Toyota",
            model: "Corolla",
            year: 2020,
            licensePlate: "ABC1234",
            registrationNumber: "REG123",
            chassisNumber: "CHASSIS123",
            engineNumber: "ENGINE123",
        }
    }
    return base
}

const policyBaseFields: FieldSpec[] = [
    { kind: "string", name: "policyNumber", min: 1, max: 50, required: true },
    // Sin .allow('') en el schema real: aunque no tiene .min(), Joi igual
    // rechaza "" por defecto en cualquier .string().
    { kind: "string", name: "referenceNumber", max: 50, required: false },
    { kind: "enum", name: "status", values: ["ACTIVE", "EXPIRED", "CANCELLED", "SUSPENDED"], required: false },
    { kind: "date", name: "startDate", required: false },
    { kind: "date", name: "expirationDate", required: false },
    { kind: "number", name: "totalAmount", positive: true, required: false },
    { kind: "number", name: "installments", min: 1, integer: true, required: false },
    { kind: "enum", name: "paymentMethod", values: ["Debit", "Credit", "Transfer", "Cash"], required: false },
    { kind: "uuid", name: "clientId", required: true },
    { kind: "uuid", name: "companyId", required: true },
    { kind: "uuid", name: "coverageId", required: false },
    // insuranceType queda afuera del fuzzer generico: no es un campo aislado,
    // cambia que sub-schema de detalle es requerido/forbidden (union
    // discriminada). Se cubre en el describe "switching de insuranceType" de
    // abajo con una matriz explicita de 9x9 combinaciones.
]
fuzzSchemaFields("createPolicySchema (campos base, insuranceType=OTHER)", createPolicySchema, policyBaseFields, () => validPolicyBase("OTHER"))

describe("createPolicySchema.insuranceType (requerido + valores invalidos)", () => {
    it("rechaza cuando insuranceType falta", () => {
        const candidate = validPolicyBase("OTHER")
        delete candidate.insuranceType
        const { error } = createPolicySchema.validate(candidate, VALIDATE_OPTIONS)
        expect(error).toBeTruthy()
    })

    it("rechaza valores de insuranceType inventados / tipo incorrecto", () => {
        for (const bad of ["NO_EXISTE", "vehicle", "", 123, null, [], {}]) {
            const candidate = { ...validPolicyBase("OTHER"), insuranceType: bad as any }
            const { error } = createPolicySchema.validate(candidate, VALIDATE_OPTIONS)
            expect(error).toBeTruthy()
        }
    })
})

// otherDetails.description (schema simple, anidado)
fuzzSchemaFields(
    "createPolicySchema.otherDetails",
    createPolicySchema,
    [
        {
            kind: "string",
            name: "otherDetails.description",
            min: 3,
            max: 500,
            required: true,
            apply: (c, v) => { c.otherDetails = { ...(c.otherDetails as any), description: v } },
            omit: (c) => { c.otherDetails = {} },
        },
    ],
    () => validPolicyBase("OTHER")
)

// vehicleDetails.* (schema mas complejo, anidado, incluye year numerico acotado)
function vehicleDetailField(name: string, field: string, spec: Record<string, unknown>): FieldSpec {
    return {
        ...spec,
        name,
        apply: (c, v) => { c.vehicleDetails = { ...(c.vehicleDetails as any), [field]: v } },
        omit: (c) => {
            const vd = { ...(c.vehicleDetails as any) }
            delete vd[field]
            c.vehicleDetails = vd
        },
    } as FieldSpec
}

const vehicleDetailFields: FieldSpec[] = [
    vehicleDetailField("vehicleDetails.brand", "brand", { kind: "string", min: 2, max: 50, required: true }),
    vehicleDetailField("vehicleDetails.model", "model", { kind: "string", min: 1, max: 50, required: true }),
    vehicleDetailField("vehicleDetails.year", "year", { kind: "number", min: 1900, max: 2100, integer: true, required: true }),
    vehicleDetailField("vehicleDetails.licensePlate", "licensePlate", { kind: "string", min: 1, max: 20, required: true }),
    vehicleDetailField("vehicleDetails.chassisNumber", "chassisNumber", { kind: "string", min: 1, max: 50, required: true }),
]
fuzzSchemaFields("createPolicySchema.vehicleDetails", createPolicySchema, vehicleDetailFields, () => validPolicyBase("VEHICLE"))

function detailsForType(type: string): Record<string, unknown> {
    switch (type) {
        case "LIABILITY": return { liabilityDetails: { activity: "comercio", coverageLimit: 100 } }
        case "BOND": return { bondDetails: { bondType: "caucion", guaranteedAmount: 100, beneficiary: "Juan Perez" } }
        case "LIFE": return { lifeDetails: { insuredAmount: 100, beneficiary: "Juan Perez" } }
        case "OTHER": return { otherDetails: { description: "detalle de prueba" } }
        case "RENTAL": return { rentalDetails: { address: "Calle 123", propertyType: "depto", rentAmount: 100, deposit: 100 } }
        case "BUSINESS": return { businessDetails: { businessName: "Mi Empresa", industry: "retail", address: "Calle 123" } }
        case "HOME": return { homeDetails: { address: "Calle 123", constructionType: "ladrillo", propertyValue: 1000 } }
        case "VEHICLE": return { vehicleDetails: validPolicyBase("VEHICLE").vehicleDetails }
        case "TRIP": return { tripDetails: { destination: "Brasil", departureDate: "2025-01-01", returnDate: "2025-01-10", passengers: 2 } }
        default: throw new Error(`tipo desconocido: ${type}`)
    }
}

describe("createPolicySchema: switching de insuranceType (matriz de los 9 tipos)", () => {
    const types = ["LIABILITY", "BOND", "LIFE", "OTHER", "RENTAL", "BUSINESS", "HOME", "VEHICLE", "TRIP"]
    for (const type of types) {
        it(`insuranceType=${type}: payload valido (solo su propio detalle) pasa`, () => {
            const base = validPolicyBase("OTHER")
            delete base.otherDetails
            const valid = { ...base, insuranceType: type, ...detailsForType(type) }

            const { error } = createPolicySchema.validate(valid, VALIDATE_OPTIONS)
            expect(error).toBeFalsy()
        })

        for (const otherType of types) {
            if (otherType === type) continue
            it(`insuranceType=${type}: mandar el detalle de "${otherType}" en vez del propio es forbidden (400)`, () => {
                const base = validPolicyBase("OTHER")
                delete base.otherDetails
                const valid = { ...base, insuranceType: type, ...detailsForType(otherType) }

                const { error } = createPolicySchema.validate(valid, VALIDATE_OPTIONS)
                expect(error).toBeTruthy()
            })
        }
    }
})

function validPolicyUpdateBase() {
    return {
        status: "ACTIVE",
        startDate: "2024-01-01",
        expirationDate: "2025-01-01",
        totalAmount: 1000,
        installments: 2,
        paymentMethod: "Cash",
    }
}
const policyUpdateFields: FieldSpec[] = [
    { kind: "enum", name: "status", values: ["ACTIVE", "EXPIRED", "CANCELLED", "SUSPENDED"], required: false },
    { kind: "date", name: "startDate", required: false },
    { kind: "date", name: "expirationDate", required: false },
    { kind: "number", name: "totalAmount", positive: true, required: false },
    { kind: "number", name: "installments", min: 1, integer: true, required: false },
    { kind: "enum", name: "paymentMethod", values: ["Debit", "Credit", "Transfer", "Cash"], required: false },
]
fuzzSchemaFields("updatePolicySchema", updatePolicySchema, policyUpdateFields, validPolicyUpdateBase)

// --- 3. Siniestro (Claim) ---------------------------------------------------
function validClaimBase() {
    return {
        policyId: crypto.randomUUID(),
        incidentDate: "2024-06-01",
        contactDate: "2024-06-02",
        notes: "siniestro de prueba",
    }
}
const claimCreateFields: FieldSpec[] = [
    { kind: "uuid", name: "policyId", required: true },
    { kind: "date", name: "incidentDate", required: true },
    { kind: "date", name: "contactDate", required: false },
    { kind: "string", name: "notes", min: 0, max: 1000, required: false, allowNull: true, allowEmptyString: true },
]
fuzzSchemaFields("createClaimSchema", createClaimSchema, claimCreateFields, validClaimBase)

function validClaimUpdateBase() {
    return { contactDate: "2024-06-02", notes: "actualizado", status: "OPEN" }
}
const claimUpdateFields: FieldSpec[] = [
    { kind: "date", name: "contactDate", required: false },
    { kind: "string", name: "notes", min: 0, max: 1000, required: false, allowNull: true, allowEmptyString: true },
    { kind: "enum", name: "status", values: ["OPEN", "CLOSED"], required: false },
]
fuzzSchemaFields("updateClaimSchema", updateClaimSchema, claimUpdateFields, validClaimUpdateBase)

// --- 4. Compania -------------------------------------------------------------
function validCompanyBase() {
    return { name: "Aseguradora Test", commissionRate: 10 }
}
const companyCreateFields: FieldSpec[] = [
    { kind: "string", name: "name", min: 2, max: 50, required: true },
    { kind: "number", name: "commissionRate", min: 0, max: 100, required: false },
]
fuzzSchemaFields("createCompanySchema", createCompanySchema, companyCreateFields, validCompanyBase)
const companyUpdateFields: FieldSpec[] = companyCreateFields.map((f) => ({ ...f, required: false }))
fuzzSchemaFields("updateCompanySchema", updateCompanySchema, companyUpdateFields, validCompanyBase)

// --- 5. Mensaje rapido ------------------------------------------------------
function validQuickMessageBase() {
    return { name: "Saludo", message: "Hola, gracias por contactarnos" }
}
const quickMessageFields: FieldSpec[] = [
    { kind: "string", name: "name", min: 2, max: 100, required: true },
    { kind: "string", name: "message", min: 1, max: 1000, required: true },
]
fuzzSchemaFields("createQuickMessageSchema", createQuickMessageSchema, quickMessageFields, validQuickMessageBase)
const quickMessageUpdateFields: FieldSpec[] = quickMessageFields.map((f) => ({ ...f, required: false }))
fuzzSchemaFields("updateQuickMessageSchema", updateQuickMessageSchema, quickMessageUpdateFields, validQuickMessageBase)

// --- 6. Auth (verify 2FA login) ----------------------------------------------
function validVerifyTwoFactorBase() {
    return { preAuthToken: "a.b.c", code: "123456" }
}
const verifyTwoFactorFields: FieldSpec[] = [
    // preAuthToken es Joi.string().required() SIN min/max: cualquier string no
    // vacio (incluso muy largo) es "valido" a nivel schema; solo se prueba
    // type-confusion + ausencia, no limites de longitud inventados. Joi rechaza
    // "" por defecto en cualquier .string() salvo .allow(''), asi que NO se
    // marca allowEmptyString.
    { kind: "string", name: "preAuthToken", required: true },
    { kind: "string", name: "code", min: 6, max: 9, required: true },
]
fuzzSchemaFields("verifyTwoFactorLoginSchema", verifyTwoFactorLoginSchema, verifyTwoFactorFields, validVerifyTwoFactorBase)

// --- 7. TwoFactorAuth (confirm / disable) ------------------------------------
function validConfirmSetupBase() {
    return { code: "123456" }
}
const confirmSetupFields: FieldSpec[] = [
    { kind: "string", name: "code", exactLength: 6, digitsOnly: true, required: true },
]
fuzzSchemaFields("confirmSetupSchema", confirmSetupSchema, confirmSetupFields, validConfirmSetupBase)

function validDisable2FABase() {
    return { password: "Sup3r$ecret!", code: "123456" }
}
const disable2FAFields: FieldSpec[] = [
    // password es Joi.string().required() SIN min/max en este schema.
    { kind: "string", name: "password", required: true },
    { kind: "string", name: "code", exactLength: 6, digitsOnly: true, required: true },
]
fuzzSchemaFields("disable2FASchema", disable2FASchema, disable2FAFields, validDisable2FABase)

// ===========================================================================
// Confirmacion HTTP end-to-end (no por campo, por endpoint): valida que el
// pipeline completo ruta -> auth -> validate.middleware -> 400/201 funciona
// igual que el schema aislado, sin repetir el volumen de arriba por red.
// ===========================================================================
describe("Fuzzing HTTP end-to-end (confirmacion de cableado, no de volumen)", () => {
    const reg = createRegistry()
    afterAll(async () => {
        await cleanupRegistry(reg)
    })

    it("POST /api/clientes: rechaza payloads invalidos representativos con 400", async () => {
        const broker = await createBroker(reg)
        const invalidPayloads = [
            { firstName: "A", lastName: "Gomez", documentNumber: "1", phone: "099123456", email: "a@a.com", address: "Calle 1" },
            { firstName: 123, lastName: "Gomez", documentNumber: "1", phone: "099123456", email: "a@a.com", address: "Calle 1" },
            { firstName: "Ana", lastName: null, documentNumber: "1", phone: "099123456", email: "a@a.com", address: "Calle 1" },
            { firstName: "Ana", lastName: "Gomez", documentNumber: "1".repeat(31), phone: "099123456", email: "a@a.com", address: "Calle 1" },
            {},
        ]
        for (const payload of invalidPayloads) {
            const res = await api.post("/api/clientes").set(bearerFor(broker)).send(payload as any)
            expect(res.status).toBe(400)
        }
    })

    it("POST /api/clientes: acepta payloads validos representativos con 201", async () => {
        const broker = await createBroker(reg)
        const validPayloads = [validClientBase(), { ...validClientBase(), notes: "" }, { ...validClientBase(), notes: null }]
        for (const payload of validPayloads) {
            const res = await api.post("/api/clientes").set(bearerFor(broker)).send({ ...payload, documentNumber: `DOC-${crypto.randomUUID().slice(0, 8)}-${Date.now()}` })
            expect(res.status).toBe(201)
            reg.clientIds.push(res.body.client.id)
        }
    })

    it("POST /api/companias: rechaza invalidos (400) y acepta validos (201)", async () => {
        const broker = await createBroker(reg)
        const bad = await api.post("/api/companias").set(bearerFor(broker)).send({ name: "A" })
        expect(bad.status).toBe(400)
        const ok = await api.post("/api/companias").set(bearerFor(broker)).send({ name: `Cia-${crypto.randomUUID().slice(0, 8)}` })
        expect(ok.status).toBe(201)
        reg.companyIds.push(ok.body.company.id)
    })

    it("POST /api/mensajes-rapidos: rechaza invalidos (400) y acepta validos (201)", async () => {
        const broker = await createBroker(reg)
        const bad = await api.post("/api/mensajes-rapidos").set(bearerFor(broker)).send({ name: "A", message: "" })
        expect(bad.status).toBe(400)
        const ok = await api.post("/api/mensajes-rapidos").set(bearerFor(broker)).send(validQuickMessageBase())
        expect(ok.status).toBe(201)
        reg.quickMessageIds.push(ok.body.quickMessage.id)
    })

    it("POST /api/auth/login/verify-2fa: rechaza codigo con formato invalido (400)", async () => {
        const res = await api.post("/api/auth/login/verify-2fa").send({ preAuthToken: "x", code: "1" })
        expect(res.status).toBe(400)
    })
})

afterAll(() => {
    // Deja constancia de cuantos campos/casos se corrieron realmente, para el reporte.
    // eslint-disable-next-line no-console
    console.info(`[fuzzing] campos cubiertos: ${fuzzResults.length}`)
})
