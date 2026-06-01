import {Router} from 'express';
import multer from 'multer';
import {ocrController} from '../controllers/ocr.controller';
import {authenticate, authorizeRoles} from '../middlewares/auth.middleware';
import {Role} from '../generated/prisma';

const routes = Router();

const upload = multer({storage: multer.memoryStorage(), limits: {fileSize: 10 * 1024 * 1024}}); // Queda en memoria, limite de 10MB

routes.post('/cedula', authenticate, authorizeRoles(Role.BROKER, Role.SUB_BROKER), upload.single('imagen'), ocrController);

export default routes;