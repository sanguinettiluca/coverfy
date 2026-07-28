import { Router } from "express";
import {
    createQuickMessageController,
    listQuickMessagesController,
    getQuickMessageByIdController,
    updateQuickMessageController,
    deleteQuickMessageController
} from "../controllers/quickMessage.controller";
import { authenticate, authorizeRoles } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { createQuickMessageSchema, updateQuickMessageSchema } from "../validators/quickMessage.validator";
import { Role } from "../generated/prisma";

const router = Router()
const allowedRoles = [Role.BROKER, Role.SUB_BROKER]

router.get('/', authenticate, authorizeRoles(...allowedRoles), listQuickMessagesController)
router.get('/:id', authenticate, authorizeRoles(...allowedRoles), getQuickMessageByIdController)
router.post('/', authenticate, authorizeRoles(...allowedRoles), validate(createQuickMessageSchema), createQuickMessageController)
router.put('/:id', authenticate, authorizeRoles(...allowedRoles), validate(updateQuickMessageSchema), updateQuickMessageController)
router.delete('/:id', authenticate, authorizeRoles(...allowedRoles), deleteQuickMessageController)

export default router
