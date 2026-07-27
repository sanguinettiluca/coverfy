import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import authRoutes from "./routes/auth.routes"
import path from "path"
import clientRoutes from "./routes/cliente.routes"
import companiaRoutes from './routes/compania.routes'
import coberturaRoutes from './routes/cobertura.routes'
import polizaRoutes from './routes/poliza.routes'
import ocrRoutes from './routes/ocr.routes'
import siniestroRoutes from './routes/siniestro.routes' 
import reporteRoutes from './routes/reporte.routes'
import mensajeRapidoRoutes from "./routes/mensajeRapido.routes"

// Cargamos las variables de entorno del archivo .env
dotenv.config({ path: path.resolve(__dirname, '../.env') })

const app = express()
const PORT = process.env.PORT || 3000

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
app.use('/api/companias', companiaRoutes)

// Rutas de WhatsApp
app.use('/api/mensajes-rapidos', mensajeRapidoRoutes)

// Rutas de coberturas
app.use('/api/coberturas', coberturaRoutes)

// Rutas de pólizas
app.use('/api/polizas', polizaRoutes)

// Rutas de OCR
app.use('/api/ocr', ocrRoutes)

// Rutas de siniestros
app.use('/api/siniestros', siniestroRoutes)

// Rutas de reportes
app.use('/api/reportes', reporteRoutes)

// --- Servidor -----------------------------------------------
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`)
})