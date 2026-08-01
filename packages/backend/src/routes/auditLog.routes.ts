import { Router } from "express";
import { listAuditLogsController } from "../controllers/auditLog.controller";
import { authenticate, authorizeRoles } from "../middlewares/auth.middleware";
import { Role } from "../generated/prisma";

const router = Router()

// Solo ADMIN puede consultar el registro de auditoria interno
router.get('/', authenticate, authorizeRoles(Role.ADMIN), listAuditLogsController)

export default router
