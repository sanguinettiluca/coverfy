import { Router } from "express";
import{
    createPolicyController,
    listPoliciesController,
    updatePolicyController,
    deletePolicyController,
    getPolicyByIdController
} from '../controllers/policy.controller'
import { authenticate, authorizeRoles } from "../middlewares/auth.middleware";
import { Role } from "../generated/prisma";
import { validate } from "../middlewares/validate.middleware";
import { createPolicySchema, updatePolicySchema } from "../validators/policy.validator";

const router = Router()
const allowedRoles = [Role.BROKER, Role.SUB_BROKER]

router.get('/', authenticate, authorizeRoles(...allowedRoles), listPoliciesController)
router.get('/:id', authenticate, authorizeRoles(...allowedRoles), getPolicyByIdController)
router.post('/', authenticate, authorizeRoles(...allowedRoles), validate(createPolicySchema), createPolicyController)
router.put('/:id', authenticate, authorizeRoles(...allowedRoles), validate(updatePolicySchema), updatePolicyController)
router.delete('/:id', authenticate, authorizeRoles(...allowedRoles), deletePolicyController)

export default router
