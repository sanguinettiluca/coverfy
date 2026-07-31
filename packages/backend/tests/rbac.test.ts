import { describe, it, expect, beforeAll, afterAll } from "vitest"
import crypto from "crypto"
import { Role } from "../src/generated/prisma"
import { basePrisma } from "../src/config/prisma"
import {
    api,
    createRegistry,
    cleanupRegistry,
    createAdmin,
    createBroker,
    createSubBroker,
    tokenFor,
    expiredToken,
    tokenWithWrongSecret,
    manipulatedToken,
    authHeader,
    bearerFor,
    CreatedUser,
} from "./helpers"

// ===========================================================================
// SECCION 4 - RBAC: matriz completa sobre TODOS los endpoints montados en
// src/app.ts (relevados a mano desde cada archivo routes/*.ts). Por cada
// endpoint protegido se prueba:
//   - sin token                                -> 401
//   - token expirado                           -> 401
//   - token con firma invalida (otro secreto)  -> 401
//   - token valido pero manipulado (firma alterada) -> 401
//   - los 3 roles (ADMIN, BROKER, SUB_BROKER): el/los rol(es) permitido(s)
//     deben pasar el gate (no 401/403); el resto debe dar 403.
//
// El criterio de "exito" para el rol autorizado, segun el endpoint, es o
// bien el status exacto de exito real (200/201) o bien un status de negocio
// (400/404) cuando el endpoint necesita un recurso real que a proposito NO
// se crea/borra en cada corrida (para que el suite sea repetible x3 sin
// acumular ni destruir datos). Ver el campo `successStatuses` de cada caso.
// ===========================================================================

type RoleReq = "any" | Role[]

interface Ctx {
    clientId: string
    companyId: string
    policyId: string
    claimId: string
    quickMessageId: string
}

interface RouteCase {
    method: "get" | "post" | "put" | "delete"
    label: string
    allowed: RoleReq
    path: (ctx: Ctx) => string
    build?: (req: any, ctx: Ctx) => any
    successStatuses: number[]
    // Registra en el registry cualquier recurso creado por un caso "201 real",
    // para que cleanupRegistry lo borre al final (evita fugas de datos).
    afterSuccess?: (res: any, reg: ReturnType<typeof createRegistry>) => void
}

const randomId = () => crypto.randomUUID()

const routeCases: RouteCase[] = [
    // --- /api/auth -----------------------------------------------------
    { method: "get", label: "GET /auth/me", allowed: "any", path: () => "/api/auth/me", successStatuses: [200] },
    { method: "post", label: "POST /auth/logout", allowed: "any", path: () => "/api/auth/logout", successStatuses: [200] },
    { method: "post", label: "POST /auth/2fa/setup", allowed: "any", path: () => "/api/auth/2fa/setup", successStatuses: [200] },
    {
        method: "post", label: "POST /auth/2fa/confirm (sin setup previo)", allowed: "any", path: () => "/api/auth/2fa/confirm",
        build: (r) => r.send({ code: "000000" }), successStatuses: [400],
    },
    {
        method: "post", label: "POST /auth/2fa/disable (2FA no activo)", allowed: "any", path: () => "/api/auth/2fa/disable",
        build: (r) => r.send({ password: "x", code: "000000" }), successStatuses: [400],
    },
    {
        method: "post", label: "POST /auth/users (crear usuario)", allowed: [Role.ADMIN], path: () => "/api/auth/users",
        build: (r) => r.send({ email: `qa-coverfy-test-rbac-${crypto.randomUUID()}@coverfy-test.local`, password: "Sup3r$ecret!Z", name: "RBAC User", role: "BROKER" }),
        successStatuses: [201],
        afterSuccess: (res, reg) => { if (res.body?.user?.id) reg.userIds.push(res.body.user.id) },
    },
    { method: "get", label: "GET /auth/brokers", allowed: [Role.ADMIN], path: () => "/api/auth/brokers", successStatuses: [200] },

    // --- /api/clientes (ADMIN excluido a proposito por el schema de roles) --
    { method: "get", label: "GET /clientes", allowed: [Role.BROKER, Role.SUB_BROKER], path: () => "/api/clientes", successStatuses: [200] },
    { method: "get", label: "GET /clientes/:id (propio)", allowed: [Role.BROKER, Role.SUB_BROKER], path: (ctx) => `/api/clientes/${ctx.clientId}`, successStatuses: [200] },
    { method: "get", label: "GET /clientes/:id (inexistente)", allowed: [Role.BROKER, Role.SUB_BROKER], path: () => `/api/clientes/${randomId()}`, successStatuses: [404] },
    { method: "get", label: "GET /clientes/documento/:doc (inexistente)", allowed: [Role.BROKER, Role.SUB_BROKER], path: () => "/api/clientes/documento/NO-EXISTE-9999", successStatuses: [404] },
    {
        method: "post", label: "POST /clientes", allowed: [Role.BROKER, Role.SUB_BROKER], path: () => "/api/clientes",
        build: (r) => r.send({ firstName: "RBAC", lastName: "Test", documentNumber: `RBAC-${crypto.randomUUID().slice(0, 10)}`, phone: "099000000", email: "rbac@example.com", address: "Direccion" }),
        successStatuses: [201],
        afterSuccess: (res, reg) => { if (res.body?.client?.id) reg.clientIds.push(res.body.client.id) },
    },
    { method: "put", label: "PUT /clientes/:id (inexistente)", allowed: [Role.BROKER, Role.SUB_BROKER], path: () => `/api/clientes/${randomId()}`, build: (r) => r.send({ address: "x" }), successStatuses: [400] },
    { method: "delete", label: "DELETE /clientes/:id (inexistente)", allowed: [Role.BROKER, Role.SUB_BROKER], path: () => `/api/clientes/${randomId()}`, successStatuses: [400] },

    // --- /api/companias --------------------------------------------------
    { method: "get", label: "GET /companias", allowed: [Role.BROKER, Role.SUB_BROKER], path: () => "/api/companias", successStatuses: [200] },
    { method: "get", label: "GET /companias/:id (propia)", allowed: [Role.BROKER, Role.SUB_BROKER], path: (ctx) => `/api/companias/${ctx.companyId}`, successStatuses: [200] },
    {
        method: "post", label: "POST /companias", allowed: [Role.BROKER, Role.SUB_BROKER], path: () => "/api/companias",
        build: (r) => r.send({ name: `RBAC Co ${crypto.randomUUID().slice(0, 8)}` }), successStatuses: [201],
        afterSuccess: (res, reg) => { if (res.body?.company?.id) reg.companyIds.push(res.body.company.id) },
    },
    { method: "put", label: "PUT /companias/:id (inexistente)", allowed: [Role.BROKER, Role.SUB_BROKER], path: () => `/api/companias/${randomId()}`, build: (r) => r.send({ name: "x nombre" }), successStatuses: [400] },
    { method: "delete", label: "DELETE /companias/:id (inexistente)", allowed: [Role.BROKER, Role.SUB_BROKER], path: () => `/api/companias/${randomId()}`, successStatuses: [400] },

    // --- /api/mensajes-rapidos --------------------------------------------
    { method: "get", label: "GET /mensajes-rapidos", allowed: [Role.BROKER, Role.SUB_BROKER], path: () => "/api/mensajes-rapidos", successStatuses: [200] },
    { method: "get", label: "GET /mensajes-rapidos/:id (propio)", allowed: [Role.BROKER, Role.SUB_BROKER], path: (ctx) => `/api/mensajes-rapidos/${ctx.quickMessageId}`, successStatuses: [200] },
    {
        method: "post", label: "POST /mensajes-rapidos", allowed: [Role.BROKER, Role.SUB_BROKER], path: () => "/api/mensajes-rapidos",
        build: (r) => r.send({ name: "RBAC", message: "mensaje rbac" }), successStatuses: [201],
        afterSuccess: (res, reg) => { if (res.body?.quickMessage?.id) reg.quickMessageIds.push(res.body.quickMessage.id) },
    },
    { method: "put", label: "PUT /mensajes-rapidos/:id (inexistente)", allowed: [Role.BROKER, Role.SUB_BROKER], path: () => `/api/mensajes-rapidos/${randomId()}`, build: (r) => r.send({ message: "x" }), successStatuses: [400] },
    { method: "delete", label: "DELETE /mensajes-rapidos/:id (inexistente)", allowed: [Role.BROKER, Role.SUB_BROKER], path: () => `/api/mensajes-rapidos/${randomId()}`, successStatuses: [400] },

    // --- /api/coberturas (sin validate.middleware en esta ruta) -----------
    { method: "get", label: "GET /coberturas", allowed: [Role.BROKER, Role.SUB_BROKER], path: (ctx) => `/api/coberturas?companyId=${ctx.companyId}`, successStatuses: [200] },
    {
        method: "post", label: "POST /coberturas", allowed: [Role.BROKER, Role.SUB_BROKER], path: () => "/api/coberturas",
        build: (r, ctx) => r.send({ name: `RBAC Cov ${crypto.randomUUID().slice(0, 6)}`, companyId: ctx.companyId, insuranceType: "OTHER" }),
        successStatuses: [201],
        afterSuccess: (res, reg) => { if (res.body?.coverage?.id) reg.coverageIds.push(res.body.coverage.id) },
    },
    // OJO: la ruta no tiene :id (router.put('/', ...)) y el controller lee
    // req.params.id (siempre undefined) -- documentado como hallazgo: PUT/DELETE
    // de coberturas nunca puede apuntar a una cobertura especifica.
    { method: "put", label: "PUT /coberturas (sin :id, ver hallazgo)", allowed: [Role.BROKER, Role.SUB_BROKER], path: () => "/api/coberturas", build: (r) => r.send({ name: "x" }), successStatuses: [400] },
    { method: "delete", label: "DELETE /coberturas (sin :id, ver hallazgo)", allowed: [Role.BROKER, Role.SUB_BROKER], path: () => "/api/coberturas", successStatuses: [400] },

    // --- /api/polizas ------------------------------------------------------
    { method: "get", label: "GET /polizas", allowed: [Role.BROKER, Role.SUB_BROKER], path: () => "/api/polizas", successStatuses: [200] },
    { method: "get", label: "GET /polizas/:id (propia)", allowed: [Role.BROKER, Role.SUB_BROKER], path: (ctx) => `/api/polizas/${ctx.policyId}`, successStatuses: [200] },
    { method: "put", label: "PUT /polizas/:id (inexistente)", allowed: [Role.BROKER, Role.SUB_BROKER], path: () => `/api/polizas/${randomId()}`, build: (r) => r.send({ totalAmount: 1 }), successStatuses: [400] },
    { method: "delete", label: "DELETE /polizas/:id (inexistente)", allowed: [Role.BROKER, Role.SUB_BROKER], path: () => `/api/polizas/${randomId()}`, successStatuses: [400] },

    // --- /api/siniestros -----------------------------------------------------
    { method: "get", label: "GET /siniestros", allowed: [Role.BROKER, Role.SUB_BROKER], path: () => "/api/siniestros", successStatuses: [200] },
    { method: "get", label: "GET /siniestros/:id (propio)", allowed: [Role.BROKER, Role.SUB_BROKER], path: (ctx) => `/api/siniestros/${ctx.claimId}`, successStatuses: [200] },
    { method: "put", label: "PUT /siniestros/:id (inexistente)", allowed: [Role.BROKER, Role.SUB_BROKER], path: () => `/api/siniestros/${randomId()}`, build: (r) => r.send({ notes: "x" }), successStatuses: [400] },
    { method: "delete", label: "DELETE /siniestros/:id (inexistente)", allowed: [Role.BROKER, Role.SUB_BROKER], path: () => `/api/siniestros/${randomId()}`, successStatuses: [400] },

    // --- /api/reportes ------------------------------------------------------
    { method: "get", label: "GET /reportes/estadisticas", allowed: [Role.BROKER, Role.SUB_BROKER], path: () => "/api/reportes/estadisticas", successStatuses: [200] },

    // --- /api/auditoria (solo ADMIN) ------------------------------------
    { method: "get", label: "GET /auditoria", allowed: [Role.ADMIN], path: () => "/api/auditoria", successStatuses: [200] },

    // --- /api/ocr (multipart; se prueba sin archivo para no invocar
    // Tesseract/Gemini real en una matriz masiva -- ver nota de cabecera) ----
    { method: "post", label: "POST /ocr/cedula (sin archivo)", allowed: [Role.BROKER, Role.SUB_BROKER], path: () => "/api/ocr/cedula", successStatuses: [400] },
    { method: "post", label: "POST /ocr/reconocimiento (sin archivo)", allowed: [Role.BROKER, Role.SUB_BROKER], path: () => "/api/ocr/reconocimiento", successStatuses: [400] },
]

const ALL_ROLES: Role[] = [Role.ADMIN, Role.BROKER, Role.SUB_BROKER]

describe("RBAC: matriz completa (endpoint x estado de token x rol)", () => {
    const reg = createRegistry()
    let admin: CreatedUser
    let broker: CreatedUser
    let subBroker: CreatedUser
    let ctx: Ctx

    function actorForRole(role: Role): CreatedUser {
        if (role === Role.ADMIN) return admin
        if (role === Role.BROKER) return broker
        return subBroker
    }

    beforeAll(async () => {
        admin = await createAdmin(reg)
        broker = await createBroker(reg)
        subBroker = await createSubBroker(reg, broker.id)

        const client = await basePrisma.client.create({
            data: {
                firstName: "RBAC", lastName: "Fixture", documentNumber: `RBAC-FIX-${crypto.randomUUID().slice(0, 8)}`,
                phone: "099000000", email: "rbacfixture@example.com", address: "Direccion", brokerId: broker.id, createdById: broker.id,
            },
        })
        reg.clientIds.push(client.id)
        const company = await basePrisma.company.create({ data: { name: `RBAC Fixture Co ${crypto.randomUUID().slice(0, 6)}`, brokerId: broker.id } })
        reg.companyIds.push(company.id)
        const policy = await basePrisma.policy.create({
            data: {
                policyNumber: `RBAC-POL-${crypto.randomUUID().slice(0, 8)}`, insuranceType: "OTHER",
                clientId: client.id, companyId: company.id, brokerId: broker.id,
                otherDetails: { create: { description: "fixture" } },
            },
        })
        reg.policyIds.push(policy.id)
        const claim = await basePrisma.claim.create({ data: { incidentDate: new Date("2024-01-01"), policyId: policy.id, brokerId: broker.id } })
        reg.claimIds.push(claim.id)
        const quickMessage = await basePrisma.quickMessage.create({ data: { name: "RBAC QM", message: "mensaje", brokerId: broker.id } })
        reg.quickMessageIds.push(quickMessage.id)

        ctx = { clientId: client.id, companyId: company.id, policyId: policy.id, claimId: claim.id, quickMessageId: quickMessage.id }
    }, 60000)

    afterAll(async () => {
        await cleanupRegistry(reg)
    })

    function buildRequest(route: RouteCase, headers: Record<string, string>) {
        const path = route.path(ctx)
        let req = (api as any)[route.method](path).set(headers)
        if (route.build) req = route.build(req, ctx)
        return req
    }

    for (const route of routeCases) {
        describe(route.label, () => {
            it("sin token -> 401", async () => {
                const res = await buildRequest(route, {})
                expect(res.status).toBe(401)
            })

            it("token expirado -> 401", async () => {
                const res = await buildRequest(route, authHeader(expiredToken(broker)))
                expect(res.status).toBe(401)
            })

            it("token con firma de otro secreto -> 401", async () => {
                const res = await buildRequest(route, authHeader(tokenWithWrongSecret(broker)))
                expect(res.status).toBe(401)
            })

            it("token valido pero manipulado -> 401", async () => {
                const res = await buildRequest(route, authHeader(manipulatedToken(tokenFor(broker))))
                expect(res.status).toBe(401)
            })

            for (const role of ALL_ROLES) {
                const isAllowed = route.allowed === "any" || route.allowed.includes(role)
                if (isAllowed) {
                    it(`rol ${role} (permitido) -> ${route.successStatuses.join("/")}`, async () => {
                        const res = await buildRequest(route, bearerFor(actorForRole(role)))
                        expect(route.successStatuses).toContain(res.status)
                        expect(res.status).not.toBe(401)
                        expect(res.status).not.toBe(403)
                        route.afterSuccess?.(res, reg)
                    })
                } else {
                    it(`rol ${role} (NO permitido) -> 403`, async () => {
                        const res = await buildRequest(route, bearerFor(actorForRole(role)))
                        expect(res.status).toBe(403)
                    })
                }
            }
        })
    }
})
