import { Request, Response } from "express";
import { listAuditLogs } from "../services/auditLog.service";
import { AuditAction } from "../generated/prisma";

export async function listAuditLogsController(req: Request, res: Response): Promise<void> {
    try {
        const actionRaw = req.query.action as string | undefined;
        const filters = {
            actorId: req.query.actorId as string | undefined,
            entity: req.query.entity as string | undefined,
            action: actionRaw && Object.values(AuditAction).includes(actionRaw as AuditAction)
                ? (actionRaw as AuditAction) : undefined,
            dateFrom: req.query.dateFrom ? new Date(req.query.dateFrom as string) : undefined,
            dateTo: req.query.dateTo ? new Date(req.query.dateTo as string) : undefined,
            page: req.query.page ? Number(req.query.page) : 1,
            perPage: req.query.perPage ? Number(req.query.perPage) : 20
        }
        const result = await listAuditLogs(filters)
        res.status(200).json(result)
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ message: error.message })
            return
        }
        res.status(500).json({ message: 'Error interno del servidor' })
    }
}
