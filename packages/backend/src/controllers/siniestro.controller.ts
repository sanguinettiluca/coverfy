import {Request, Response} from 'express';
import {
    createSiniestro,
    listarSiniestros,
    obtenerSiniestrosPorId,
    actualizarSiniestro,
    eliminarSiniestro
} from '../services/siniestro.service';
import {CreateSiniestroDTO, UpdateSiniestroDTO} from '../domain/siniestro';
import {EstadoSiniestro} from '../generated/prisma';

export async function crearSiniestroController(req: Request, res: Response): Promise<void>{
    try{
        const {userId, role, brokerId: brokerIdToken} = req.user!;
        const brokerId = role === "SUB_BROKER" && brokerIdToken ? brokerIdToken : userId;

        const siniestro = await createSiniestro(req.body as CreateSiniestroDTO, brokerId);
        res.status(201).json({message: "Siniestro registrado exitosamente", siniestro});
    }catch(error){
        if(error instanceof Error){
            res.status(400).json({message: error.message});
            return;
        }
        res.status(500).json({message: "Error interno del servidor"});
    }
}

export async function listarSiniestrosController(req: Request, res: Response): Promise<void>{
    try{
        const {userId, role, brokerId: brokerIdToken} = req.user!;
        const brokerId = role === "SUB_BROKER" && brokerIdToken ? brokerIdToken : userId;

        const estadoRaw = req.query.estado as string | undefined;
        // Validar que el estado sea uno de los valores permitidos o undefined
        const estado = estadoRaw && Object.values(EstadoSiniestro)
        .includes(estadoRaw as EstadoSiniestro) ? (estadoRaw as EstadoSiniestro): undefined;

        const filtros = {
            estado,
            busqueda: req.query.busqueda as string | undefined,
            pagina: req.query.pagina ? Number(req.query.pagina) : 1,
            porPagina: req.query.porPagina ? Number(req.query.porPagina) : 10
        };

        const resultado = await listarSiniestros(brokerId, filtros);
        res.status(200).json(resultado);
    }catch(error){
        if(error instanceof Error){
            res.status(400).json({message: error.message});
            return;
        }
        res.status(500).json({message: "Error interno del servidor"});
    }
}

export async function obtenerSiniestroPorIdController(req: Request, res: Response): Promise<void>{
    try{
        const {userId, role, brokerId: brokerIdToken} = req.user!;
        const brokerId = role === "SUB_BROKER" && brokerIdToken ? brokerIdToken : userId;

        const siniestro = await obtenerSiniestrosPorId(req.params.id as string, brokerId);
        res.status(200).json(siniestro);
    }catch(error){
        // Usamos el error 404 y no 400 porque el error mas común 
        // es que el siniestro no exista o no pertenezca al broker,
        //  lo cual es un error de "no encontrado"
        if(error instanceof Error){
            res.status(404).json({message: error.message});
            return;
        }
        res.status(500).json({message: "Error interno del servidor"});
    }
}

export async function actualizarSiniestroController(req: Request, res: Response): Promise<void>{
    try{
        const {userId, role, brokerId: brokerIdToken} = req.user!;
        const brokerId = role === "SUB_BROKER" && brokerIdToken ? brokerIdToken : userId;

        const siniestro = await actualizarSiniestro(req.params.id as string, brokerId, req.body as UpdateSiniestroDTO);
        res.status(200).json({message: "Siniestro actualizado correctamente", siniestro});
    }catch(error){
        if(error instanceof Error){
            res.status(400).json({message: error.message});
            return;
        }
        res.status(500).json({message: "Error interno del servidor"});
    }
}

export async function eliminarSiniestroController(req: Request, res: Response): Promise<void>{
    try{
        const {userId, role, brokerId: brokerIdToken} = req.user!;
        const brokerId = role === "SUB_BROKER" && brokerIdToken ? brokerIdToken : userId;
        const resultado = await eliminarSiniestro(req.params.id as string, brokerId);
        res.status(200).json(resultado);
    }catch(error){
        if(error instanceof Error){
            res.status(400).json({message: error.message});
            return;
        }
        res.status(500).json({message: "Error interno del servidor"});
    }
}