import { Router } from "express";
import {
    createClientController,
    listClientsController,
    getClientByIdController,
    updateClientController,
    deleteClientController,
    findClientByDocumentController
} from "../controllers/client.controller";
import {authenticate, authorizeRoles} from "../middlewares/auth.middleware";
import { Role } from "../generated/prisma"
import { createClientSchema, updateClientSchema } from "../validators/client.validator"
import { validate } from "../middlewares/validate.middleware"

const router = Router();

// Roles permitidos para acceder a las rutas de cliente
const allowedRoles = [Role.SUB_BROKER, Role.BROKER];

router.get('/', authenticate, authorizeRoles(...allowedRoles), listClientsController);
router.get('/:id', authenticate, authorizeRoles(...allowedRoles), getClientByIdController);
router.get('/documento/:documentNumber', authenticate, authorizeRoles(...allowedRoles), findClientByDocumentController);
router.post('/', authenticate, authorizeRoles(...allowedRoles), validate(createClientSchema), createClientController);
router.put('/:id', authenticate, authorizeRoles(...allowedRoles), validate(updateClientSchema), updateClientController);
router.delete('/:id', authenticate, authorizeRoles(...allowedRoles), deleteClientController);

export default router;
