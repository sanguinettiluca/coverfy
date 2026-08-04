import { Request, Response } from "express";
import {
    createPolicy,
    listPolicies,
    updatePolicy,
    deletePolicy,
    getPolicyById,
    reactivatePolicy
} from '../services/policy.service'
import { CreatePolicyDTO, UpdatePolicyDTO } from "../domain/policy";
import { PolicyStatus } from "../generated/prisma";

export async function createPolicyController(req: Request, res: Response): Promise<void>{
    try{
        const {userId, role, brokerId: brokerIdToken} = req.user!
        const carteraId = role === 'SUB_BROKER' && brokerIdToken ? brokerIdToken : userId

        const policy = await createPolicy(req.body, carteraId, userId)

        res.status(201).json({
            message: 'Poliza creada exitosamente',
            policy
        })
    }catch(error){
        if(error instanceof Error){
            res.status(400).json({ message: error.message })
            return
        }
        res.status(500).json({ message: 'Error interno del servidor' })
    }
}

export async function listPoliciesController(req: Request, res: Response): Promise<void>{
    try{
        const {userId, role, brokerId: brokerIdToken} = req.user!
        const brokerId = role === 'SUB_BROKER' && brokerIdToken ? brokerIdToken : userId
        const statusRaw = req.query.status as string | undefined
        const filters = {
            search: req.query.search as string | undefined,
            clientId: req.query.clientId as string | undefined,
            companyId: req.query.companyId as string | undefined,
            status: statusRaw && Object.values(PolicyStatus).includes(statusRaw as PolicyStatus)
                ? (statusRaw as PolicyStatus) : undefined,
            page: req.query.page ? Number(req.query.page) : 1,
            perPage: req.query.perPage ? Number(req.query.perPage) : 10
        }
        const result = await listPolicies(brokerId, filters)
        res.status(200).json(result)
    }catch(error){
        if(error instanceof Error){
            res.status(400).json({ message: error.message })
            return
        }
        res.status(500).json({ message: 'Error interno del servidor' })
    }
}

export async function updatePolicyController(req: Request, res: Response): Promise<void>{
    try{
        const {userId, role, brokerId: brokerIdToken} = req.user!
        const id = req.params.id as string
        const brokerId = role === 'SUB_BROKER' && brokerIdToken ? brokerIdToken : userId

        const updatedPolicy = await updatePolicy(id, brokerId, req.body)
        res.status(200).json({
            message: 'Póliza actualizada correctamente',
            policy: updatedPolicy
        })
    }catch(error){
        if(error instanceof Error){
            res.status(400).json({ message: error.message })
            return
        }
        res.status(500).json({ message: 'Error interno del servidor' })
    }
}

export async function deletePolicyController(req: Request, res: Response): Promise<void>{
    try{
        const {userId, role, brokerId: brokerIdToken} = req.user!
        const id = req.params.id as string
        const brokerId = role === 'SUB_BROKER' && brokerIdToken ? brokerIdToken : userId
        const result = await deletePolicy(id, brokerId)
        res.status(200).json(result)
    }catch(error){
        if(error instanceof Error){
            res.status(400).json({ message: error.message })
            return
        }
        res.status(500).json({ message: 'Error interno del servidor' })
    }
}

export async function getPolicyByIdController(req: Request, res: Response): Promise<void>{
    try{
        const {userId, role, brokerId: brokerIdToken} = req.user!
        const id = req.params.id as string
        const brokerId = role === 'SUB_BROKER' && brokerIdToken ? brokerIdToken : userId
        const policy = await getPolicyById(id, brokerId)
        res.status(200).json(policy)
    }
    catch(error){
        if(error instanceof Error){
            res.status(404).json({ message: error.message })
            return
        }
        res.status(500).json({ message: 'Error interno del servidor' })
    }
}

export async function reactivatePolicyController(req: Request, res: Response): Promise<void>{
    try{
        const {userId, role, brokerId: brokerIdToken} = req.user!
        const id = req.params.id as string
        const brokerId = role === 'SUB_BROKER' && brokerIdToken ? brokerIdToken : userId
        const policy = await reactivatePolicy(id, brokerId)
        res.status(200).json({
            message: "Poliza reactivada exitosamente",
            policy
        })
    }catch(error){
        if(error instanceof Error){
            res.status(404).json({ message: error.message })
            return
        }
        res.status(500).json({ message: 'Error interno del servidor' })
    }
}