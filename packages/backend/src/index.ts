import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import authRoutes from "./routes/auth.routes"
import path from "path"

// Cargamos las variables de entorno del archivo .env
dotenv.config({ path: path.resolve(__dirname, '../.env') })

const app = express()
const PORT = process.env.PORT || 3000

// Permite requests desde el frontend
app.use(cors())

// Permite parsear el body de las requests como JSON
app.use(express.json())

// ─── Rutas ────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'Coverfy API is running' })
})

// Rutas de autenticación (login, crear usuario, perfil)
app.use('/api/auth', authRoutes)

// ─── Servidor ─────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`)
})