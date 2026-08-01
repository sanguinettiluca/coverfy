import { Request, Response, NextFunction } from "express"
import crypto from "crypto"
import { auditContextStorage, AuditContext } from "../context/requestContext"
import { basePrisma } from "../config/prisma"

declare global {
    namespace Express {
        interface Request {
            requestId?: string
        }
    }
}

// Middleware global: arranca un contexto de AsyncLocalStorage para toda la request y,
// cuando la respuesta termina, escribe UNA fila de auditoria (action=REQUEST) por cada
// request HTTP -- incluye GETs, para tener trazabilidad total de que consulto cada usuario.
export function auditMiddleware(req: Request, res: Response, next: NextFunction): void {
    const requestId = crypto.randomUUID()
    req.requestId = requestId
    const start = Date.now()

    const store: AuditContext = {
        requestId,
        ip: req.ip,
        method: req.method,
        path: req.originalUrl
    }

    // OJO: 'finish' puede dispararse fuera del contexto sincronico original, por eso
    // leemos todo directo de req/res (capturados por closure) y no del store de ALS.
    res.on('finish', () => {
        basePrisma.auditLog.create({
            data: {
                requestId,
                action: 'REQUEST',
                actorId: req.user?.userId ?? null,
                actorEmail: req.user?.email ?? null,
                actorRole: req.user?.role ?? null,
                actingBrokerId: req.user?.brokerId ?? null,
                method: req.method,
                path: req.originalUrl,
                statusCode: res.statusCode,
                ip: req.ip,
                durationMs: Date.now() - start
            }
        }).catch((error) => {
            console.error('[audit] error al registrar request:', error)
        })
    })

    auditContextStorage.run(store, next)
}
