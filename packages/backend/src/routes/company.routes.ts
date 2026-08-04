import { Router } from "express";
import{
    createCompanyController,
    listCompaniesController,
    getCompanyByIdController,
    updateCompanyController,
    deleteCompanyController,
    reactivateCompanyController
} from '../controllers/company.controller'
import { authenticate, authorizeRoles } from "../middlewares/auth.middleware";
import { Role } from "../generated/prisma";
import { validate } from "../middlewares/validate.middleware";
import { createCompanySchema, updateCompanySchema } from "../validators/company.validator";

const router = Router()
const allowedRoles = [Role.BROKER, Role.SUB_BROKER]

router.get('/', authenticate, authorizeRoles(...allowedRoles), listCompaniesController)
router.get('/:id', authenticate, authorizeRoles(...allowedRoles), getCompanyByIdController)
router.post('/', authenticate, authorizeRoles(...allowedRoles), validate(createCompanySchema), createCompanyController)
router.put('/:id', authenticate, authorizeRoles(...allowedRoles), validate(updateCompanySchema), updateCompanyController)
router.delete('/:id', authenticate, authorizeRoles(...allowedRoles), deleteCompanyController)
router.patch('/:id/reactivate', authenticate, authorizeRoles(...allowedRoles), reactivateCompanyController)

export default router
