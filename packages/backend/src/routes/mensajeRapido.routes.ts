import { Router } from "express";
import {
    crearMensajeRapidoController,
    listarMensajesRapidosController,
    obtenerMensajeRapidoPorIdController,
    actualizarMensajeRapidoController,
    eliminarMensajeRapidoController
} from "../controllers/mensajeRapido.controller";
import { authenticate, authorizeRoles } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { crearMensajeRapidoSchema, actualizarMensajeRapidoSchema } from "../validators/mensajeRapido.validator";
import { Role } from "../generated/prisma";

const router = Router()
const roles = [Role.BROKER, Role.SUB_BROKER]

router.get('/', authenticate, authorizeRoles(...roles), listarMensajesRapidosController)
router.get('/:id', authenticate, authorizeRoles(...roles), obtenerMensajeRapidoPorIdController)
router.post('/', authenticate, authorizeRoles(...roles), validate(crearMensajeRapidoSchema), crearMensajeRapidoController)
router.put('/:id', authenticate, authorizeRoles(...roles), validate(actualizarMensajeRapidoSchema), actualizarMensajeRapidoController)
router.delete('/:id', authenticate, authorizeRoles(...roles), eliminarMensajeRapidoController)

export default router