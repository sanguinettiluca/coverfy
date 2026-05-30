import {Router} from 'express';
import {
    crearSiniestroController,
    listarSiniestrosController,
    obtenerSiniestroPorIdController,
    actualizarSiniestroController,
    eliminarSiniestroController
} from '../controllers/siniestro.controller';
import { authenticate, authorizeRoles } from "../middlewares/auth.middleware";
import { Role } from "../generated/prisma";

const router = Router();
const operadores = [Role.BROKER, Role.SUB_BROKER];

router.get("/", authenticate, authorizeRoles(...operadores), listarSiniestrosController);
router.get("/:id", authenticate, authorizeRoles(...operadores), obtenerSiniestroPorIdController);
router.post("/", authenticate, authorizeRoles(...operadores), crearSiniestroController);
router.put("/:id", authenticate, authorizeRoles(...operadores), actualizarSiniestroController);
router.delete("/:id", authenticate, authorizeRoles(...operadores), eliminarSiniestroController);

export default router;