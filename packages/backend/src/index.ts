import dotenv from "dotenv"
import path from "path"

// Cargamos las variables de entorno del archivo .env antes de importar la app
// (la app crea el PrismaClient y otros singletons al importarse)
dotenv.config({ path: path.resolve(__dirname, '../.env') })

import app from "./app"

const PORT = process.env.PORT || 3000

// --- Servidor -----------------------------------------------
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`)
})
