import dotenv from 'dotenv'
import path from 'path'

// Debe ejecutarse antes de que cualquier test importe src/app.ts (que crea el PrismaClient)
dotenv.config({ path: path.resolve(__dirname, '../.env') })
