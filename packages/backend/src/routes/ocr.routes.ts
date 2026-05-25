import { Router } from "express";
import multer from "multer";
import { escanearCedulaController } from "../controllers/ocr.controller";
import { authenticate, authorizeRoles } from "../middlewares/auth.middleware";
import { Role } from "../generated/prisma";

const router = Router();

// Usamos memoryStorage: el buffer queda en memoria, no se escribe en disco
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB máximo
});

router.post(
  "/cedula",
  authenticate,
  authorizeRoles(Role.BROKER, Role.SUB_BROKER),
  upload.single("archivo"),
  escanearCedulaController
);

export default router;