import { Router } from "express";
import {
    createCoverageController,
    listCoveragesController,
    updateCoverageController,
    deleteCoverageController
} from "../controllers/coverage.controller";
import { authenticate, authorizeRoles } from "../middlewares/auth.middleware";
import { Role } from "../generated/prisma";

const router = Router()
const allowedRoles = [Role.BROKER, Role.SUB_BROKER]

router.get('/', authenticate, authorizeRoles(...allowedRoles), listCoveragesController)
router.post('/', authenticate, authorizeRoles(...allowedRoles), createCoverageController)
router.put('/', authenticate, authorizeRoles(...allowedRoles), updateCoverageController)
router.delete('/', authenticate, authorizeRoles(...allowedRoles), deleteCoverageController)

export default router
