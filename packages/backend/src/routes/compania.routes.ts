import { Router } from "express";
import{
    crearCompaniaController,
    listarCompaniasController,
    obtenerCompaniaController,
    actualizarCompaniaController,
    eliminarCompaniaController
} from '../controllers/compania.controller'
import { authenticate, authorizeRoles } from "../middlewares/auth.middleware";
import { Role } from "../generated/prisma";

const router = Router()
const soloOperadores = [Role.BROKER, Role.SUB_BROKER]

router.get('/', authenticate, authorizeRoles(...soloOperadores), listarCompaniasController)
router.get('/:id', authenticate, authorizeRoles(...soloOperadores), obtenerCompaniaController)
router.post('/', authenticate, authorizeRoles(...soloOperadores), crearCompaniaController)
router.put('/:id', authenticate, authorizeRoles(...soloOperadores), actualizarCompaniaController)
router.delete('/:id', authenticate, authorizeRoles(...soloOperadores), eliminarCompaniaController)

export default router