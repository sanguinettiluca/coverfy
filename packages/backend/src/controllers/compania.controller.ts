import { Request, Response } from "express";
import {
    crearCompania,
    listarCompanias,
    obtenerCompaniaPorId,
    actualizarCompania,
    eliminarCompania
} from '../services/compania.service'

export async function crearCompaniaController(req: Request, res: Response): Promise<void>{
    try{
        const {userId, role, brokerId: brokerIdToken} = req.user!
        const brokerId = role === 'SUB_BROKER' && brokerIdToken ? brokerIdToken: userId
        const compania = await crearCompania(req.body, brokerId)
        res.status(201).json({
            message: 'Compañía creada correctamente',
            compania
        })
    }catch(error){
        if(error instanceof Error){
            res.status(400).json({ message: error.message })
            return
        }
        res.status(500).json({ message: 'Error interno del servidor' })
    }
}

export async function listarCompaniasController(req: Request, res: Response): Promise<void>{
    try{
        const {userId, role, brokerId: brokerIdToken} = req.user!
        const brokerId = role === 'SUB_BROKER' && brokerIdToken ? brokerIdToken : userId

        const companias = await listarCompanias(brokerId)
        res.status(200).json(companias)
    }catch(error){
        if(error instanceof Error){
            res.status(400).json({ message: error.message })
            return
        }
        res.status(500).json({ message: 'Error interno del servidor' })
    }
}

export async function obtenerCompaniaController(req: Request, res: Response): Promise<void>{
    try{
        const {userId, role, brokerId: brokerIdToken} = req.user!
        const id = req.params.id as string
        const brokerId = role === 'SUB_BROKER' && brokerIdToken ? brokerIdToken : userId

        const compania = await obtenerCompaniaPorId(id, brokerId)
        res.status(200).json(compania)
    }catch(error){
        if(error instanceof Error){
            res.status(404).json({message: error.message})
            return
        }
        res.status(500).json({ message: 'Error interno del servidor' })
    }
}

export async function actualizarCompaniaController(req: Request, res: Response): Promise<void> {
    try{
        const { userId, role, brokerId: brokerIdToken } = req.user!
        const id = req.params.id as string
        const brokerId = role === 'SUB_BROKER' && brokerIdToken ? brokerIdToken : userId

        const compania = await actualizarCompania(id, brokerId, req.body)
        res.status(200).json({
            message: 'Compañía actualizada correctamente',
            compania
        })
    }catch(error){
        if(error instanceof Error){
            res.status(400).json({ message: error.message })
            return
        }
        res.status(500).json({ message: 'Error interno del servidor' })
    }
}

export async function eliminarCompaniaController(req: Request, res: Response): Promise<void>{
    try{
        const { userId, role, brokerId: brokerIdToken } = req.user!
        const id = req.params.id as string
        const brokerId = role === 'SUB_BROKER' && brokerIdToken ? brokerIdToken : userId

        const resultado = await eliminarCompania(id, brokerId)
        res.status(200).json(resultado)
    }catch(error){
        if(error instanceof Error){
            res.status(400).json({message: error.message})
            return
        }
        res.status(500).json({ message: 'Error interno del servidor' })
    }
}