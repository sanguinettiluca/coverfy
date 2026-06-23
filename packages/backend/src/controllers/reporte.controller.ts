import {Request, Response} from 'express';
import {obtenerEstadisticas} from '../services/reporte.service';

export async function obtenerEstadisticasController(req: Request, res: Response): Promise<void> {
    try{
        const {userId, role, brokerId: brokerIdToken} = req.user!;
        const brokerId = role === "SUB_BROKER" && brokerIdToken ? brokerIdToken : userId;
        const estadisticas = await obtenerEstadisticas(brokerId);
        res.status(200).json(estadisticas);

    }catch(error){
        if(error instanceof Error){
            res.status(400).json({error: error.message});
            return;
        }
        res.status(500).json({message: "Error interno del servidor"});
    }

}