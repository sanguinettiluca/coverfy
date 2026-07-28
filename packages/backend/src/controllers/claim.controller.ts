import {Request, Response} from 'express';
import {
    createClaim,
    listClaims,
    getClaimById,
    updateClaim,
    deleteClaim
} from '../services/claim.service';
import {CreateClaimDTO, UpdateClaimDTO} from '../domain/claim';
import {ClaimStatus} from '../generated/prisma';

export async function createClaimController(req: Request, res: Response): Promise<void>{
    try{
        const {userId, role, brokerId: brokerIdToken} = req.user!;
        const brokerId = role === "SUB_BROKER" && brokerIdToken ? brokerIdToken : userId;

        const claim = await createClaim(req.body as CreateClaimDTO, brokerId);
        res.status(201).json({message: "Siniestro registrado exitosamente", claim});
    }catch(error){
        if(error instanceof Error){
            res.status(400).json({message: error.message});
            return;
        }
        res.status(500).json({message: "Error interno del servidor"});
    }
}

export async function listClaimsController(req: Request, res: Response): Promise<void>{
    try{
        const {userId, role, brokerId: brokerIdToken} = req.user!;
        const brokerId = role === "SUB_BROKER" && brokerIdToken ? brokerIdToken : userId;

        const statusRaw = req.query.status as string | undefined;
        // Validar que el estado sea uno de los valores permitidos o undefined
        const status = statusRaw && Object.values(ClaimStatus)
        .includes(statusRaw as ClaimStatus) ? (statusRaw as ClaimStatus): undefined;

        const filters = {
            status,
            search: req.query.search as string | undefined,
            page: req.query.page ? Number(req.query.page) : 1,
            perPage: req.query.perPage ? Number(req.query.perPage) : 10
        };

        const result = await listClaims(brokerId, filters);
        res.status(200).json(result);
    }catch(error){
        if(error instanceof Error){
            res.status(400).json({message: error.message});
            return;
        }
        res.status(500).json({message: "Error interno del servidor"});
    }
}

export async function getClaimByIdController(req: Request, res: Response): Promise<void>{
    try{
        const {userId, role, brokerId: brokerIdToken} = req.user!;
        const brokerId = role === "SUB_BROKER" && brokerIdToken ? brokerIdToken : userId;

        const claim = await getClaimById(req.params.id as string, brokerId);
        res.status(200).json(claim);
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

export async function updateClaimController(req: Request, res: Response): Promise<void>{
    try{
        const {userId, role, brokerId: brokerIdToken} = req.user!;
        const brokerId = role === "SUB_BROKER" && brokerIdToken ? brokerIdToken : userId;

        const claim = await updateClaim(req.params.id as string, brokerId, req.body as UpdateClaimDTO);
        res.status(200).json({message: "Siniestro actualizado correctamente", claim});
    }catch(error){
        if(error instanceof Error){
            res.status(400).json({message: error.message});
            return;
        }
        res.status(500).json({message: "Error interno del servidor"});
    }
}

export async function deleteClaimController(req: Request, res: Response): Promise<void>{
    try{
        const {userId, role, brokerId: brokerIdToken} = req.user!;
        const brokerId = role === "SUB_BROKER" && brokerIdToken ? brokerIdToken : userId;
        const result = await deleteClaim(req.params.id as string, brokerId);
        res.status(200).json(result);
    }catch(error){
        if(error instanceof Error){
            res.status(400).json({message: error.message});
            return;
        }
        res.status(500).json({message: "Error interno del servidor"});
    }
}
