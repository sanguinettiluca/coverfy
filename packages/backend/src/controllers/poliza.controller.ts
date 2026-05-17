import { Request, Response } from "express";
import {
    crearPoliza,
    listarPolizas,
    actualizarPoliza,
    eliminarPoliza,
    obtenerPolizaPorId
} from '../services/poliza.service'
import { CreatePolizaDTO, UpdatePolizaDTO } from "../domain/poliza";

export async function crearPolizaController(req: Request, res: Response): Promise<void>{
    try{
        const {userId, role, brokerId: brokerIdToken} = req.user!
        const brokerId = role === 'SUB_BROKER' && brokerIdToken ? brokerIdToken : userId
        
        // Describir explicitamente los tipos de poliza permitidos:
        const tiposPermitidos = ["RESPONSABILIDAD_CIVIL", "FIANZA", "VIDA", "OTROS"];
        if(!req.body.tipoSeguro || !tiposPermitidos.includes(req.body.tipoSeguro)){
            res.status(400).json({message: "El tipo de seguro no es valido."});
            return;
        }

        const poliza = await crearPoliza(req.body, brokerId);
        res.status(201).json({message: "Poliza creada exitosamente", poliza});
    }catch(error){
        if(error instanceof Error){
            res.status(400).json({message: error.message});
            return;
        }
        res.status(500).json({message: "Error interno del servidor"})
    }
}

export async function listarPolizasController(req: Request, res: Response): Promise<void>{
    try{
        const {userId, role, brokerId: brokerIdToken} = req.user!
        const brokerId = role === 'SUB_BROKER' && brokerIdToken ? brokerIdToken : userId
        const filtros = {
            busqueda: req.query.busqueda as string | undefined,
            pagina: req.query.pagina ? Number(req.query.pagina) : 1,
            porPagina: req.query.porPagina ? Number(req.query.porPagina) : 10
        }
        const resultado = await listarPolizas(brokerId, filtros)
        res.status(200).json(resultado)
    }catch(error){
        if(error instanceof Error){
            res.status(400).json({ message: error.message })
            return
        }
        res.status(500).json({ message: 'Error interno del servidor' })
    }
}

export async function actualizarPolizaController(req: Request, res: Response): Promise<void>{
    try{
        const {userId, role, brokerId: brokerIdToken} = req.user!
        const id = req.params.id as string
        const brokerId = role === 'SUB_BROKER' && brokerIdToken ? brokerIdToken : userId
        
        const polizaActualizada = await actualizarPoliza(id, brokerId, req.body)
        res.status(200).json({
            message: 'Póliza actualizada correctamente',
            poliza: polizaActualizada
        })
    }catch(error){
        if(error instanceof Error){
            res.status(400).json({ message: error.message })
            return
        }
        res.status(500).json({ message: 'Error interno del servidor' })
    }
}

export async function eliminarPolizaController(req: Request, res: Response): Promise<void>{
    try{
        const {userId, role, brokerId: brokerIdToken} = req.user!
        const id = req.params.id as string
        const brokerId = role === 'SUB_BROKER' && brokerIdToken ? brokerIdToken : userId
        const resultado = await eliminarPoliza(id, brokerId)
        res.status(200).json(resultado)
    }catch(error){
        if(error instanceof Error){
            res.status(400).json({ message: error.message })
            return
        }
        res.status(500).json({ message: 'Error interno del servidor' })
    }
}

export async function obtenerPolizaPorIdController(req: Request, res: Response): Promise<void>{
    try{
        const {userId, role, brokerId: brokerIdToken} = req.user!
        const id = req.params.id as string
        const brokerId = role === 'SUB_BROKER' && brokerIdToken ? brokerIdToken : userId
        const poliza = await obtenerPolizaPorId(id, brokerId)
        res.status(200).json(poliza)
    }
    catch(error){
        if(error instanceof Error){
            res.status(404).json({ message: error.message })
            return
        }
        res.status(500).json({ message: 'Error interno del servidor' })
    }
}