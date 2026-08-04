import { Router } from "express";
import {
    createCoverageController,
    listCoveragesController,
    updateCoverageController,
    deleteCoverageController,
    reactivateCoverageController
} from "../controllers/coverage.controller";
import { authenticate, authorizeRoles } from "../middlewares/auth.middleware";
import { Role } from "../generated/prisma";

const router = Router()
const allowedRoles = [Role.BROKER, Role.SUB_BROKER]

router.get('/', authenticate, authorizeRoles(...allowedRoles), listCoveragesController)
router.post('/', authenticate, authorizeRoles(...allowedRoles), createCoverageController)
router.put('/:id', authenticate, authorizeRoles(...allowedRoles), updateCoverageController)
router.delete('/:id', authenticate, authorizeRoles(...allowedRoles), deleteCoverageController)
router.patch('/:id/reactivate', authenticate, authorizeRoles(...allowedRoles), reactivateCoverageController)

export default router