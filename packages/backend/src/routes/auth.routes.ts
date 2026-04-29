import { Router } from "express"
import { createUserController, loginController, logoutController, meController } from "../controllers/auth.controller"
import { authenticate, authorizeRoles } from "../middlewares/auth.middleware"
import { Role } from "../generated/prisma"

const router = Router()

// RUTAS PUBLICAS:

router.post('/login', loginController)

// RUTAS PROTEGIDAS:

router.get('/me', authenticate, meController)

// Solo los admins pueden crear nuevos usuarios (brokers o sub-brokers)
router.post('/users', authenticate, authorizeRoles(Role.ADMIN), createUserController)

router.post('/logout', authenticate, logoutController)

export default router