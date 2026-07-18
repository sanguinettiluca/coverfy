import { Router } from "express";
import {
    crearClienteController,
    listarClientesController,
    obtenerClientePorIdController,
    actualizarClienteController,
    eliminarClienteController,
    buscarClientePorDocumentoController
} from "../controllers/cliente.controller";
import {authenticate, authorizeRoles} from "../middlewares/auth.middleware";
import { Role } from "../generated/prisma"
import { crearClienteSchema, actualizarClienteSchema } from "../validators/cliente.validator"
import { validate } from "../middlewares/validate.middleware"

const router = Router();

// Roles permitidos para acceder a las rutas de cliente
const allowedRoles = [Role.SUB_BROKER, Role.BROKER];

router.get('/', authenticate, authorizeRoles(...allowedRoles), listarClientesController);
router.get('/:id', authenticate, authorizeRoles(...allowedRoles), obtenerClientePorIdController);
router.get('/documento/:documento', authenticate, authorizeRoles(...allowedRoles), buscarClientePorDocumentoController);
router.post('/', authenticate, authorizeRoles(...allowedRoles), validate(crearClienteSchema), crearClienteController);
router.put('/:id', authenticate, authorizeRoles(...allowedRoles), validate(actualizarClienteSchema), actualizarClienteController);
router.delete('/:id', authenticate, authorizeRoles(...allowedRoles), eliminarClienteController);

export default router;