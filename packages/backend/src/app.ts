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

const app = express()

// Permite requests desde el frontend
app.use(cors())

// Permite parsear el body de las requests como JSON
app.use(express.json())

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

export default app
