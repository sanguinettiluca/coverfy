import { Router } from "express"
import { 
    createUserController, 
    listarBrokersController, 
    loginController, 
    logoutController, 
    meController, 
    verifyTwoFactorLoginController
} from "../controllers/auth.controller"
import { authenticate, authorizeRoles } from "../middlewares/auth.middleware"
import { Role } from "../generated/prisma"
import { validate } from "../middlewares/validate.middleware"
import { verifyTwoFactorLoginSchema } from "../validators/auth.validator"
import { confirmController, disableController, setupController } from "../controllers/twoFactorAuth.controller"
import { confirmSetupSchema, disable2FASchema } from "../validators/twoFactorAuth.validator"

const router = Router()

// RUTAS PUBLICAS:

router.post('/login', loginController)
router.post('/login/verify-2fa', validate(verifyTwoFactorLoginSchema), verifyTwoFactorLoginController)

// RUTAS PROTEGIDAS:

router.get('/me', authenticate, meController)

// Solo los admins pueden crear nuevos usuarios (brokers o sub-brokers)
router.post('/users', authenticate, authorizeRoles(Role.ADMIN), createUserController)
router.get('/brokers', authenticate,authorizeRoles(Role.ADMIN), listarBrokersController)

router.post('/logout', authenticate, logoutController)

router.post('/2fa/setup', authenticate, setupController)
router.post('/2fa/confirm', authenticate, validate(confirmSetupSchema), confirmController)
router.post('/2fa/disable', authenticate, validate(disable2FASchema), disableController)

export default router