import { PrismaClient } from "../generated/prisma";

//Singleton pattern para evitar múltiples instancias de PrismaClient y problemas de conexión a la base de datos
const prisma = new PrismaClient({
    log: ['error', 'warn'], // Muestra errores y advertencias en consola
});

export default prisma;