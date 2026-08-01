import {Router} from 'express';
import {
    createClaimController,
    listClaimsController,
    getClaimByIdController,
    updateClaimController,
    deleteClaimController
} from '../controllers/claim.controller';
import { authenticate, authorizeRoles } from "../middlewares/auth.middleware";
import { Role } from "../generated/prisma";
import { validate } from "../middlewares/validate.middleware";
import { createClaimSchema, updateClaimSchema } from "../validators/claim.validator";

const router = Router();
const allowedRoles = [Role.BROKER, Role.SUB_BROKER];

router.get("/", authenticate, authorizeRoles(...allowedRoles), listClaimsController);
router.get("/:id", authenticate, authorizeRoles(...allowedRoles), getClaimByIdController);
router.post("/", authenticate, authorizeRoles(...allowedRoles), validate(createClaimSchema), createClaimController);
router.put("/:id", authenticate, authorizeRoles(...allowedRoles), validate(updateClaimSchema), updateClaimController);
router.delete("/:id", authenticate, authorizeRoles(...allowedRoles), deleteClaimController);

export default router;
