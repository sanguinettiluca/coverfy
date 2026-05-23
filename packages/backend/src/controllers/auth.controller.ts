import { Request, Response } from "express"
import * as authService from "../services/auth.service"
import { Role } from "../generated/prisma"

// CREAR USUARIO:
export async function createUserController(req: Request, res: Response): Promise<void> {
    try{
        const {email, password, nombre, role, brokerId} = req.body

        // Validar los campos obligatorios
        if(!email || !password || !nombre || !role){
            res.status(400).json({message: "Faltan campos obligatorios"})
            return
        }

        // Validar que el rol sea válido
        if(!Object.values(Role).includes(role)){
            res.status(400).json({message: "Rol inválido (BROKER o SUB_BROKER)"})
            return
        }

        const user = await authService.createUser({email, password, nombre, role, brokerId})

        res.status(201).json({
            message: "Usuario creado exitosamente",
            user
        })

    } catch (error) {
        // Captura errores conocidos del servicio (email duplicado, broker inválido, etc.)
        if (error instanceof Error) {
            res.status(401).json({ message: error.message })
            return
        }

        res.status(500).json({message: "Error interno"})
    }
}

// LOGIN:
export async function loginController(req: Request, res: Response): Promise<void> {
    try{
        const {email, password} = req.body

        // Validar los campos obligatorios
        if(!email || !password){
            res.status(400).json({message: "Faltan campos obligatorios"})
            return
        }

        const authResponse = await authService.login({email, password})

        res.status(200).json(authResponse)
    } catch (error) {
        // Captura errores conocidos del servicio
        if (error instanceof Error) {
            res.status(401).json({ message: error.message })
            return
        }

        res.status(500).json({message: "Error interno"})
    }
}

// LOGOUT:
export async function logoutController(req: Request, res: Response): Promise<void> {
    try{
        const token = req.headers.authorization!.substring(7)
        await authService.logout(token)
        res.status(200).json({ message: 'Logout exitoso' })
    }catch (error) {
        res.status(500).json({message: "Error interno"})
    }
}

// PERFIL:
export async function meController(req: Request, res: Response): Promise<void> {
    try{
        res.status(200).json({ user: req.user })
    }catch (error) {
        res.status(500).json({message: "Error interno"})
    }
}