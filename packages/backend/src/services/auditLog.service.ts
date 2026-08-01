import prisma from "../config/prisma";
import { FilterAuditLogDTO } from "../domain/auditLog";

export async function listAuditLogs(filters: FilterAuditLogDTO) {
    const { actorId, entity, action, dateFrom, dateTo, page = 1, perPage = 20 } = filters;
    const where: any = {};

    if (actorId) {
        where.actorId = actorId;
    }

    if (entity) {
        where.entity = entity;
    }

    if (action) {
        where.action = action;
    }

    if (dateFrom || dateTo) {
        where.createdAt = {
            ...(dateFrom ? { gte: dateFrom } : {}),
            ...(dateTo ? { lte: dateTo } : {})
        };
    }

    const [logs, total] = await Promise.all([
        prisma.auditLog.findMany({
            where,
            skip: (page - 1) * perPage,
            take: perPage,
            orderBy: { createdAt: "desc" }
        }),
        prisma.auditLog.count({ where })
    ]);

    return {
        logs,
        total,
        page,
        perPage,
        totalPages: Math.ceil(total / perPage)
    };
}
