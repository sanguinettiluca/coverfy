import { AsyncLocalStorage } from "async_hooks"
import { Role } from "../generated/prisma"

// Datos que viajan "invisibles" durante toda la vida de una request HTTP.
// Se inicializan en audit.middleware.ts y se completan (userId, email, role, brokerId)
// en auth.middleware.ts una vez que el JWT fue validado.
export interface AuditContext {
    requestId: string
    ip?: string
    method: string
    path: string
    userId?: string
    email?: string
    role?: Role
    brokerId?: string | null
}

export const auditContextStorage = new AsyncLocalStorage<AuditContext>()
