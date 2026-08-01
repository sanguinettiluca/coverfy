import { AuditAction } from "../generated/prisma";

export interface FilterAuditLogDTO {
    actorId?: string;
    entity?: string;
    action?: AuditAction;
    dateFrom?: Date;
    dateTo?: Date;
    page?: number;
    perPage?: number;
}
