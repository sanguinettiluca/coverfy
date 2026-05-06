import { Router } from "express";
import { 
    crearCoberturaController, 
    listarCoberturasController,
    actualizarCoberturaController,
    eliminarCoberturaController
} from "../controllers/cobertura.controller";
import { authenticate, authorizeRoles } from "../middlewares/auth.middleware";
import { Role } from "../generated/prisma";

const router = Router()
const soloOperadores = [Role.BROKER, Role.SUB_BROKER]

router.get('/', authenticate, authorizeRoles(...soloOperadores), listarCoberturasController)
router.post('/', authenticate, authorizeRoles(...soloOperadores), crearCoberturaController)
router.put('/', authenticate, authorizeRoles(...soloOperadores), actualizarCoberturaController)
router.delete('/', authenticate, authorizeRoles(...soloOperadores), eliminarCoberturaController)

export default router