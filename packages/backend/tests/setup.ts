import dotenv from "dotenv"
import path from "path"
import { vi, afterAll } from "vitest"

// Carga las mismas variables que src/index.ts (dotenv no es automatico en vitest)
dotenv.config({ path: path.resolve(__dirname, "../.env") })

// El pooler de Supabase usado en .env tiene un limite duro de 15 sesiones
// concurrentes para TODO el proyecto (session mode). Si no lo acotamos, el propio
// pool interno de Prisma (que por defecto abre varias conexiones) puede agotarlo
// el solo, incluso corriendo los tests en serie. Lo bajamos a un valor conservador
// ANTES de que cualquier test importe src/config/prisma.ts (que crea el PrismaClient
// al importarse), para dejar margen a quien mas este usando la misma base.
const rawUrl = process.env.DATABASE_URL
if (rawUrl && !/connection_limit=/.test(rawUrl)) {
    const separator = rawUrl.includes("?") ? "&" : "?"
    process.env.DATABASE_URL = `${rawUrl}${separator}connection_limit=3&pool_timeout=30`
}

// auth.middleware.ts hace console.log en cada request autenticada (headers, req.user,
// roles requeridos). Con cientos/miles de requests de fuzzing esto inunda la salida.
// Lo silenciamos solo en el proceso de test, sin tocar el codigo de produccion.
vi.spyOn(console, "log").mockImplementation(() => {})

// Momento de arranque de la corrida completa: se usa para limpiar al final las filas
// de AuditLog/TokenBlacklist generadas por los tests, que no tienen FK hacia las
// entidades de negocio (no se pueden borrar por id de la forma en que se hace con
// User/Client/Policy/etc).
export const testRunStartedAt = new Date()

afterAll(async () => {
    const { basePrisma } = await import("../src/config/prisma")
    await basePrisma.auditLog.deleteMany({ where: { createdAt: { gte: testRunStartedAt } } })
    await basePrisma.tokenBlacklist.deleteMany({ where: { createdAt: { gte: testRunStartedAt } } })
})
