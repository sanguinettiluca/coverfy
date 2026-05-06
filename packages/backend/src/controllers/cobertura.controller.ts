import { Request, Response } from "express";
import {
    crearCobertura,
    listarCoberturas,
    actualizarCobertura,
    eliminarCobertura
} from '../services/cobertura.service'

export async function crearCoberturaController(req: Request, res: Response): Promise<void> {
    try{
        const { userId, role, brokerId: brokerIdToken } = req.user!
        const brokerId = role === 'SUB_BROKER' && brokerIdToken ? brokerIdToken : userId

        const cobertura = await crearCobertura(req.body, brokerId)

        res.status(201).json({
            message: 'Cobertura creada correctamente',
            cobertura
        })
    }catch(error){
        if(error instanceof Error){
            res.status(400).json({ message: error.message })
            return
        }
        res.status(500).json({message: 'Error interno del servidor'})
    }
}

export async function listarCoberturasController(req: Request, res: Response): Promise<void> {
    try{
        const { userId, role, brokerId: brokerIdToken } = req.user!
        const brokerId = role === 'SUB_BROKER' && brokerIdToken ? brokerIdToken : userId

        const companiaId = req.query.companiaId as string
        const tipoSeguro = req.query.tipoSeguro as string | undefined

        if(!companiaId){
            res.status(400).json({message: 'Compania es requerida'})
            return
        }
        const coberturas = await listarCoberturas(companiaId,brokerId,tipoSeguro)
        res.status(200).json(coberturas)
    }catch(error){
        if(error instanceof Error){
            res.status(400).json({message: error.message})
            return
        }
        res.status(500).json({message: 'Error interno del servidor'})
    }
}

export async function actualizarCoberturaController(req: Request, res: Response): Promise<void>{
    try{
        const { userId, role, brokerId: brokerIdToken } = req.user!
        const id = req.params.id as string
        const brokerId = role === 'SUB_BROKER' && brokerIdToken ? brokerIdToken : userId

        const cobertura = await actualizarCobertura(id, brokerId, req.body)

        res.status(200).json({
            message: 'Cobertura actualizada',
            cobertura
        })
    }catch(error){
        if(error instanceof Error){
                res.status(400).json({message: error.message})
                return
        }
        res.status(500).json({message: 'Error interno del servidor'})
    }
}

export async function eliminarCoberturaController(req: Request, res: Response): Promise<void>{
    try{
        const { userId, role, brokerId: brokerIdToken } = req.user!
        const id = req.params.id as string
        const brokerId = role === 'SUB_BROKER' && brokerIdToken ? brokerIdToken : userId

        const resultado = await eliminarCobertura(id, brokerId)
        res.status(200).json(resultado)
    }catch(error){
        if(error instanceof Error){
            res.status(400).json({message: error.message})
            return
        }
        res.status(500).json({message: 'Error interno del servidor'})
    }
}