import { Router } from "express";
import { obtenerEstadisticasController } from "../controllers/reporte.controller";
import { authenticate, authorizeRoles } from "../middlewares/auth.middleware";
import { Role } from "../generated/prisma";

const router = Router();

router.get(
    "/estadisticas",
    authenticate,
    authorizeRoles(Role.BROKER, Role.SUB_BROKER),
    obtenerEstadisticasController
);

export default router;