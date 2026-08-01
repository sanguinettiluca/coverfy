import { Router } from "express";
import { getStatisticsController } from "../controllers/report.controller";
import { authenticate, authorizeRoles } from "../middlewares/auth.middleware";
import { Role } from "../generated/prisma";

const router = Router();

router.get(
    "/estadisticas",
    authenticate,
    authorizeRoles(Role.BROKER, Role.SUB_BROKER),
    getStatisticsController
);

export default router;
