import request from "supertest"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import crypto from "crypto"
import app from "../src/app"
import { basePrisma } from "../src/config/prisma"
import { Role } from "../src/generated/prisma"

export const api = request(app)

// Marca todos los datos generados por el suite para que sean identificables a simple
// vista en Prisma Studio y para poder filtrar si algo sobrevive a la limpieza.
export const TEST_MARKER = "qa-coverfy-test"

let counter = 0
export function uniqueSuffix(): string {
    counter += 1
    return `${Date.now().toString(36)}-${counter}-${crypto.randomBytes(3).toString("hex")}`
}

export function testEmail(prefix = "user"): string {
    return `${TEST_MARKER}-${prefix}-${uniqueSuffix()}@coverfy-test.local`
}

// --- Registro de datos creados, para poder limpiar todo al final de cada archivo ---
export interface TestRegistry {
    userIds: string[]
    clientIds: string[]
    policyIds: string[]
    claimIds: string[]
    companyIds: string[]
    coverageIds: string[]
    quickMessageIds: string[]
}

export function createRegistry(): TestRegistry {
    return {
        userIds: [],
        clientIds: [],
        policyIds: [],
        companyIds: [],
        coverageIds: [],
        claimIds: [],
        quickMessageIds: [],
    }
}

// Borra todo lo creado por un registry respetando el orden que exigen las FK:
// Client cascadea Policy/Claim/Documents/*Details, asi que alcanza con borrar Client.
// Coverage y Company no tienen cascade, van despues de que las Policy que los
// referencian ya no existan.
export async function cleanupRegistry(reg: TestRegistry): Promise<void> {
    if (reg.claimIds.length) {
        await basePrisma.claim.deleteMany({ where: { id: { in: reg.claimIds } } }).catch(() => {})
    }
    if (reg.policyIds.length) {
        await basePrisma.policy.deleteMany({ where: { id: { in: reg.policyIds } } }).catch(() => {})
    }
    if (reg.clientIds.length) {
        await basePrisma.client.deleteMany({ where: { id: { in: reg.clientIds } } })
    }
    if (reg.coverageIds.length) {
        await basePrisma.coverage.deleteMany({ where: { id: { in: reg.coverageIds } } })
    }
    if (reg.companyIds.length) {
        // Red de seguridad: borra tambien cualquier Coverage de estas companias
        // que no haya quedado trackeado explicitamente en reg.coverageIds (evita
        // que una violacion de FK rompa la limpieza de todo el archivo).
        await basePrisma.coverage.deleteMany({ where: { companyId: { in: reg.companyIds } } })
        await basePrisma.company.deleteMany({ where: { id: { in: reg.companyIds } } })
    }
    if (reg.quickMessageIds.length) {
        await basePrisma.quickMessage.deleteMany({ where: { id: { in: reg.quickMessageIds } } })
    }
    // Sub-brokers antes que brokers (brokerId referencia a otro User)
    if (reg.userIds.length) {
        const users = await basePrisma.user.findMany({
            where: { id: { in: reg.userIds } },
            select: { id: true, role: true },
        })
        const subBrokerIds = users.filter((u) => u.role === Role.SUB_BROKER).map((u) => u.id)
        const otherIds = users.filter((u) => u.role !== Role.SUB_BROKER).map((u) => u.id)
        if (subBrokerIds.length) {
            await basePrisma.user.deleteMany({ where: { id: { in: subBrokerIds } } })
        }
        if (otherIds.length) {
            await basePrisma.user.deleteMany({ where: { id: { in: otherIds } } })
        }
    }
}

const DEFAULT_PASSWORD = "Sup3r$ecret!"

export interface CreatedUser {
    id: string
    email: string
    name: string
    role: Role
    brokerId: string | null
    password: string
}

// Crea un usuario directo en la base (bypaseando el endpoint /auth/users) para no
// depender de tener ya un ADMIN logueado. Se usa bcrypt con el mismo costo que
// auth.service.ts (SALT_ROUNDS=10) para que sea indistinguible de un usuario real.
export async function createUser(
    reg: TestRegistry,
    opts: { role: Role; brokerId?: string | null; name?: string; password?: string; twoFactorEnabled?: boolean }
): Promise<CreatedUser> {
    const password = opts.password ?? DEFAULT_PASSWORD
    const hashed = await bcrypt.hash(password, 10)
    const email = testEmail(opts.role.toLowerCase())
    const user = await basePrisma.user.create({
        data: {
            email,
            password: hashed,
            name: opts.name ?? `Test ${opts.role} ${uniqueSuffix()}`,
            role: opts.role,
            brokerId: opts.brokerId ?? null,
            twoFactorEnabled: opts.twoFactorEnabled ?? false,
        },
    })
    reg.userIds.push(user.id)
    return { id: user.id, email: user.email, name: user.name, role: user.role, brokerId: user.brokerId, password }
}

export async function createBroker(reg: TestRegistry, opts?: { name?: string }): Promise<CreatedUser> {
    return createUser(reg, { role: Role.BROKER, brokerId: null, name: opts?.name })
}

export async function createSubBroker(reg: TestRegistry, brokerId: string, opts?: { name?: string }): Promise<CreatedUser> {
    return createUser(reg, { role: Role.SUB_BROKER, brokerId, name: opts?.name })
}

export async function createAdmin(reg: TestRegistry, opts?: { name?: string }): Promise<CreatedUser> {
    return createUser(reg, { role: Role.ADMIN, brokerId: null, name: opts?.name })
}

// Firma un JWT real con el mismo secreto/forma de payload que auth.service.ts,
// evitando pasar por bcrypt.compare (10 rounds) en matrices con decenas de usuarios.
// Es equivalente a login(): auth.middleware.ts solo verifica firma + blacklist.
// jwt.sign trunca `iat` a segundos: si se firman dos tokens para el MISMO
// usuario dentro del mismo segundo de reloj, el header+payload+iat quedan
// identicos y el JWT resultante es literalmente el mismo string. Eso hace que
// un logout() en un test (que blacklistea ese string exacto) invalide sin
// querer un token "distinto" emitido para otro test dentro del mismo segundo.
// Se agrega un `jti` random -- ignorado por JwtPayload en produccion -- solo
// para garantizar que cada llamada a tokenFor/expiredToken/etc devuelva un
// string unico sin importar el timing.
function uniqueClaims(user: { id: string; email: string; role: Role; brokerId?: string | null }) {
    return { userId: user.id, email: user.email, role: user.role, brokerId: user.brokerId ?? null, jti: crypto.randomUUID() }
}

export function tokenFor(user: { id: string; email: string; role: Role; brokerId?: string | null }, opts?: { expiresIn?: string | number }): string {
    return jwt.sign(
        uniqueClaims(user),
        process.env.JWT_SECRET as string,
        { expiresIn: (opts?.expiresIn ?? "7d") as any }
    )
}

export function expiredToken(user: { id: string; email: string; role: Role; brokerId?: string | null }): string {
    // exp en el pasado: jwt.verify tira TokenExpiredError -> 401
    return jwt.sign(
        uniqueClaims(user),
        process.env.JWT_SECRET as string,
        { expiresIn: -10 }
    )
}

export function tokenWithWrongSecret(user: { id: string; email: string; role: Role; brokerId?: string | null }): string {
    return jwt.sign(
        uniqueClaims(user),
        "clave-incorrecta-para-el-test-de-rbac",
        { expiresIn: "7d" }
    )
}

// Token estructuralmente valido pero con la firma manipulada (cambia el ultimo
// caracter de la firma), simulando un atacante que edito el payload a mano.
export function manipulatedToken(validToken: string): string {
    const parts = validToken.split(".")
    const lastChar = parts[2].slice(-1)
    const replacement = lastChar === "A" ? "B" : "A"
    parts[2] = parts[2].slice(0, -1) + replacement
    return parts.join(".")
}

export function authHeader(token: string): { Authorization: string } {
    return { Authorization: `Bearer ${token}` }
}

export function bearerFor(user: { id: string; email: string; role: Role; brokerId?: string | null }): { Authorization: string } {
    return authHeader(tokenFor(user))
}
