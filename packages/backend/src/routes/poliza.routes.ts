import { Router } from "express";
import{
    crearPolizaController,
    listarPolizasController,
    actualizarPolizaController,
    eliminarPolizaController,
    obtenerPolizaPorIdController
} from '../controllers/poliza.controller'
import { authenticate, authorizeRoles } from "../middlewares/auth.middleware";
import { Role } from "../generated/prisma";
import { validate } from "../middlewares/validate.middleware";
import { crearPolizaSchema, actualizarPolizaSchema } from "../validators/poliza.validator";

const router = Router()
const soloOperadores = [Role.BROKER, Role.SUB_BROKER]

router.get('/', authenticate, authorizeRoles(...soloOperadores), listarPolizasController)
router.get('/:id', authenticate, authorizeRoles(...soloOperadores), obtenerPolizaPorIdController)
router.post('/', authenticate, authorizeRoles(...soloOperadores), validate(crearPolizaSchema), crearPolizaController)
router.put('/:id', authenticate, authorizeRoles(...soloOperadores), validate(actualizarPolizaSchema), actualizarPolizaController)
router.delete('/:id', authenticate, authorizeRoles(...soloOperadores), eliminarPolizaController)

export default router