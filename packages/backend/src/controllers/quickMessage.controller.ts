import { Request, Response } from "express"
import * as quickMessageService from "../services/quickMessage.service"

export async function createQuickMessageController(req: Request, res: Response): Promise<void> {
    try{
        const { userId, role, brokerId: brokerIdToken } = req.user!
        const brokerId = role === 'SUB_BROKER' && brokerIdToken ? brokerIdToken : userId

        const message = await quickMessageService.createQuickMessage(req.body, brokerId)

        res.status(201).json({message: "Mensaje creado exitosamente", quickMessage: message})
    }catch(error){
        if(error instanceof Error){
            res.status(400).json({message: error.message})
            return
        }
        res.status(500).json({message: "Error interno del servidor"})
    }
}

export async function listQuickMessagesController(req: Request, res: Response): Promise<void> {
    try{
        const { userId, role, brokerId: brokerIdToken } = req.user!
        const brokerId = role === 'SUB_BROKER' && brokerIdToken ? brokerIdToken : userId

        const messages = await quickMessageService.listQuickMessages(brokerId)

        res.status(200).json(messages)
    }catch(error){
        if(error instanceof Error){
            res.status(400).json({message: error.message})
            return
        }
        res.status(500).json({message: "Error interno del servidor"})
    }
}

export async function getQuickMessageByIdController(req: Request, res: Response): Promise<void> {
    try {
        const { userId, role, brokerId: brokerIdToken } = req.user!
        const brokerId = role === 'SUB_BROKER' && brokerIdToken ? brokerIdToken : userId
        const id = req.params.id as string

        const message = await quickMessageService.getQuickMessageById(id , brokerId)

        res.status(200).json(message)
    } catch (error) {
        if (error instanceof Error) {
            res.status(404).json({ message: error.message })
            return
        }
        res.status(500).json({ message: "Error interno del servidor" })
    }
}

export async function updateQuickMessageController(req: Request, res: Response): Promise<void> {
    try {
        const { userId, role, brokerId: brokerIdToken } = req.user!
        const brokerId = role === 'SUB_BROKER' && brokerIdToken ? brokerIdToken : userId
        const id = req.params.id as string

        const message = await quickMessageService.updateQuickMessage(id, brokerId, req.body)

        res.status(200).json({ message: "Mensaje rápido actualizado exitosamente", quickMessage: message })
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ message: error.message })
            return
        }
        res.status(500).json({ message: "Error interno del servidor" })
    }
}

export async function deleteQuickMessageController(req: Request, res: Response): Promise<void> {
    try {
        const { userId, role, brokerId: brokerIdToken } = req.user!
        const brokerId = role === 'SUB_BROKER' && brokerIdToken ? brokerIdToken : userId
        const id = req.params.id as string

        await quickMessageService.deleteQuickMessage(id, brokerId)

        res.status(200).json({ message: "Mensaje rápido eliminado exitosamente" })
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ message: error.message })
            return
        }
        res.status(500).json({ message: "Error interno del servidor" })
    }
}
