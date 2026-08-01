import { PrismaClient, Prisma } from "../generated/prisma"
import { auditContextStorage } from "../context/requestContext"
import { redact } from "../utils/auditRedact.util"

// Cliente "de base", sin la extension de auditoria. Se usa:
//  1) Para el findUnique previo al "before" de un update/delete (asi no se vuelve a
//     disparar la extension de auditoria sobre esa misma lectura)
//  2) Para escribir la propia fila de auditoria (nunca queremos auditar el insert
//     del propio AuditLog)
export const basePrisma = new PrismaClient({
    log: ['error', 'warn'], // Muestra errores y advertencias en consola
})

// Operaciones de Prisma que representan una escritura real sobre la base
const WRITE_OPERATIONS = new Set(['create', 'update', 'upsert', 'delete', 'createMany', 'updateMany', 'deleteMany'])

// Modelos que nunca se auditan a nivel de escritura:
// - AuditLog: evitar recursion (auditar la propia auditoria)
// - TokenBlacklist: mecanismo interno de logout, se audita explicitamente como LOGOUT
//   en auth.service.ts
const EXCLUDED_MODELS = new Set(['AuditLog', 'TokenBlacklist'])

// Singleton pattern para evitar múltiples instancias de PrismaClient y problemas de conexión a la base de datos.
// Se extiende con una capa de auditoria que intercepta toda escritura (create/update/upsert/delete/
// createMany/updateMany/deleteMany) en cualquier modelo y deja un registro en AuditLog con quien
// hizo el cambio (via AsyncLocalStorage, ver requestContext.ts) y que cambio (antes/despues, redactado).
const prisma = basePrisma.$extends({
    name: 'audit-log',
    query: {
        async $allOperations({ model, operation, args, query }) {
            // $queryRaw/$executeRaw no traen "model" (no se usan hoy en el proyecto, pero
            // quedan afuera por las dudas). Las lecturas no se auditan aca: esa cobertura
            // la da el middleware de request a nivel HTTP (ver audit.middleware.ts).
            if (!model || EXCLUDED_MODELS.has(model) || !WRITE_OPERATIONS.has(operation)) {
                return query(args)
            }

            const ctx = auditContextStorage.getStore()
            // El delegate del cliente siempre es el nombre del modelo con la primera letra en minuscula
            const delegateName = model.charAt(0).toLowerCase() + model.slice(1)
            const isBatch = operation === 'createMany' || operation === 'updateMany' || operation === 'deleteMany'

            let before: unknown = null
            if (!isBatch && (operation === 'update' || operation === 'delete' || operation === 'upsert')) {
                try {
                    before = await (basePrisma as any)[delegateName].findUnique({ where: (args as any).where })
                } catch {
                    before = null
                }
            }

            const result = await query(args)

            try {
                let entityId: string | null = null
                let changes: Record<string, unknown>

                if (isBatch) {
                    changes = { where: redact((args as any).where ?? {}), count: (result as any)?.count ?? null }
                } else {
                    entityId = (result as any)?.id ?? (args as any)?.where?.id ?? null
                    changes = { before: redact(before), after: redact(result) }
                }

                const action =
                    operation === 'delete' || operation === 'deleteMany' ? 'DELETE' :
                    operation === 'create' || operation === 'createMany' || (operation === 'upsert' && !before) ? 'CREATE' :
                    'UPDATE'

                await basePrisma.auditLog.create({
                    data: {
                        requestId: ctx?.requestId ?? 'sin-request-id',
                        action,
                        actorId: ctx?.userId ?? null,
                        actorEmail: ctx?.email ?? null,
                        actorRole: ctx?.role ?? null,
                        actingBrokerId: ctx?.brokerId ?? null,
                        entity: model,
                        entityId,
                        changes: changes as Prisma.InputJsonValue
                    }
                })
            } catch (auditError) {
                // Un fallo al auditar NUNCA debe romper la operacion de negocio real
                console.error('[audit] error al registrar auditoria de escritura:', auditError)
            }

            return result
        }
    }
})

export default prisma
