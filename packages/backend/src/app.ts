import express from "express"
import cors from "cors"
import authRoutes from "./routes/auth.routes"
import clientRoutes from "./routes/client.routes"
import companyRoutes from './routes/company.routes'
import coverageRoutes from './routes/coverage.routes'
import policyRoutes from './routes/policy.routes'
import ocrRoutes from './routes/ocr.routes'
import claimRoutes from './routes/claim.routes'
import reportRoutes from './routes/report.routes'
import quickMessageRoutes from "./routes/quickMessage.routes"
import auditLogRoutes from "./routes/auditLog.routes"
import { auditMiddleware } from "./middlewares/audit.middleware"

const app = express()

// Permite requests desde el frontend
app.use(cors())

// Permite parsear el body de las requests como JSON
app.use(express.json())

// Registro de auditoria: arranca el contexto de la request y loguea cada request HTTP
app.use(auditMiddleware)

// --- Rutas -----------------------------------------------
app.get('/health', (req, res) => {
  res.json({ status: 'Coverfy API is running' })
})

// Rutas de autenticación (login, crear usuario, perfil)
app.use('/api/auth', authRoutes)

// Rutas de clientes
app.use('/api/clientes', clientRoutes)

// Rutas de companias
app.use('/api/companias', companyRoutes)

// Rutas de WhatsApp
app.use('/api/mensajes-rapidos', quickMessageRoutes)

// Rutas de coberturas
app.use('/api/coberturas', coverageRoutes)

// Rutas de pólizas
app.use('/api/polizas', policyRoutes)

// Rutas de OCR
app.use('/api/ocr', ocrRoutes)

// Rutas de siniestros
app.use('/api/siniestros', claimRoutes)

// Rutas de reportes
app.use('/api/reportes', reportRoutes)

// Rutas de auditoria interna (solo ADMIN)
app.use('/api/auditoria', auditLogRoutes)

export default app
