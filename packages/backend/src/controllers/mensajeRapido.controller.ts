import { Request, Response } from "express"
import * as mensajeRapidoService from "../services/mensajeRapido.service"

export async function crearMensajeRapidoController(req: Request, res: Response): Promise<void> {
    try{
        const { userId, role, brokerId: brokerIdToken } = req.user!
        const brokerId = role === 'SUB_BROKER' && brokerIdToken ? brokerIdToken : userId

        const mensaje = await mensajeRapidoService.crearMensajeRapido(req.body, brokerId)

        res.status(201).json({message: "Mensaje creado exitosamente", mensaje})
    }catch(error){
        if(error instanceof Error){
            res.status(400).json({message: error.message})
            return
        }
        res.status(500).json({message: "Error interno del servidor"})
    }
}

export async function listarMensajesRapidosController(req: Request, res: Response): Promise<void> {
    try{
        const { userId, role, brokerId: brokerIdToken } = req.user!
        const brokerId = role === 'SUB_BROKER' && brokerIdToken ? brokerIdToken : userId
        
        const mensajes = await mensajeRapidoService.listarMensajesRapidos(brokerId)

        res.status(200).json(mensajes)
    }catch(error){
        if(error instanceof Error){
            res.status(400).json({message: error.message})
            return
        }
        res.status(500).json({message: "Error interno del servidor"})
    }
}

export async function obtenerMensajeRapidoPorIdController(req: Request, res: Response): Promise<void> {
    try {
        const { userId, role, brokerId: brokerIdToken } = req.user!
        const brokerId = role === 'SUB_BROKER' && brokerIdToken ? brokerIdToken : userId
        const id = req.params.id as string

        const mensaje = await mensajeRapidoService.obtenerMensajeRapidoPorId(id , brokerId)

        res.status(200).json(mensaje)
    } catch (error) {
        if (error instanceof Error) {
            res.status(404).json({ message: error.message })
            return
        }
        res.status(500).json({ message: "Error interno del servidor" })
    }
}

export async function actualizarMensajeRapidoController(req: Request, res: Response): Promise<void> {
    try {
        const { userId, role, brokerId: brokerIdToken } = req.user!
        const brokerId = role === 'SUB_BROKER' && brokerIdToken ? brokerIdToken : userId
        const id = req.params.id as string

        const mensaje = await mensajeRapidoService.actualizarMensajeRapido(id, brokerId, req.body)

        res.status(200).json({ message: "Mensaje rápido actualizado exitosamente", mensaje })
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ message: error.message })
            return
        }
        res.status(500).json({ message: "Error interno del servidor" })
    }
}

export async function eliminarMensajeRapidoController(req: Request, res: Response): Promise<void> {
    try {
        const { userId, role, brokerId: brokerIdToken } = req.user!
        const brokerId = role === 'SUB_BROKER' && brokerIdToken ? brokerIdToken : userId
        const id = req.params.id as string

        await mensajeRapidoService.eliminarMensajeRapido(id, brokerId)

        res.status(200).json({ message: "Mensaje rápido eliminado exitosamente" })
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ message: error.message })
            return
        }
        res.status(500).json({ message: "Error interno del servidor" })
    }
}