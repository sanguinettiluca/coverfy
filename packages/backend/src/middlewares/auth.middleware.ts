import { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import { JwtPayload } from "../domain/user"
import { Role } from "../generated/prisma"
import prisma from "../config/prisma"

// Este middleware se encarga de verificar el token JWT enviado desde el header Aut

// Extendemos el tipo Request de Express para incluir la propiedad user, 
// asi podemos acceder a la información del usuario autenticado en los controladores
declare global{
    namespace Express {
        interface Request{
            user?: JwtPayload
        }
    }
}

// Verificar JWT
// Middleware para proteger rutas que requieren autenticación
// Verifica que el token JWT enviado en el header Authorization sea válido
export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {

    console.log('Headers recibidos:', req.headers.authorization)

    // El token viene del header Authorization con el formato 'Bearer <token>'
    const authHeader = req.headers.authorization

    if(!authHeader || !authHeader.startsWith('Bearer ')){
        res.status(401).json({ message: 'Token no proporcionado' })
        return
    }

    // Extrae el token sacando el prefijo Bearer
    const token = authHeader.substring(7)

    try{
        const blacklisted = await prisma.tokenBlacklist.findFirst({
            where: { token }
        })

        if(blacklisted){
            res.status(401).json({ message: 'Token invalido o expirado' })
            return
        }

        // Decodifica el token usando la clave definida en el .env (process.env.JWT_SECRET)
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload

        // Carga los datos del usuario autenticado en el request
        req.user = decoded
        next() // Continua al siguiente middleware o controlador
    }catch(error){
        res.status(401).json({ message: 'Token invalido o expirado' })
    }
}

// Verificar el rol del usuario
// El middleware restringe el acceso a ciertas rutas dependendiendo del rol del usuario
export const authorizeRoles = (...roles: Role[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {

        console.log('req.user:', req.user)
        console.log('roles requeridos:', roles)

        if(!req.user){
            res.status(401).json({ message: 'Usuario no autenticado' })
            return
        }

        // Si el rol del usuario no esta incluido en los roles permitidos, se deniega el acceso
        if(!roles.includes(req.user.role)){
            res.status(403).json({ message: 'Acceso denegado' })
            return
        }

        next()
    }
    
}