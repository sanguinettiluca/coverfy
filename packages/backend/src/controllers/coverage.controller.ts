import { Request, Response } from "express";
import {
    createCoverage,
    listCoverages,
    updateCoverage,
    deleteCoverage
} from '../services/coverage.service'
import { InsuranceType } from "../generated/prisma";

export async function createCoverageController(req: Request, res: Response): Promise<void> {
    try{
        const { userId, role, brokerId: brokerIdToken } = req.user!
        const brokerId = role === 'SUB_BROKER' && brokerIdToken ? brokerIdToken : userId

        const coverage = await createCoverage(req.body, brokerId)

        res.status(201).json({
            message: 'Cobertura creada correctamente',
            coverage
        })
    }catch(error){
        if(error instanceof Error){
            res.status(400).json({ message: error.message })
            return
        }
        res.status(500).json({message: 'Error interno del servidor'})
    }
}

export async function listCoveragesController(req: Request, res: Response): Promise<void> {
    try{
        const { userId, role, brokerId: brokerIdToken } = req.user!
        const brokerId = role === 'SUB_BROKER' && brokerIdToken ? brokerIdToken : userId

        const companyId = req.query.companyId as string
        const insuranceType = req.query.insuranceType as InsuranceType | undefined

        if(!companyId){
            res.status(400).json({message: 'Compania es requerida'})
            return
        }
        const coverages = await listCoverages(companyId,brokerId,insuranceType)
        res.status(200).json(coverages)
    }catch(error){
        if(error instanceof Error){
            res.status(400).json({message: error.message})
            return
        }
        res.status(500).json({message: 'Error interno del servidor'})
    }
}

export async function updateCoverageController(req: Request, res: Response): Promise<void>{
    try{
        const { userId, role, brokerId: brokerIdToken } = req.user!
        const id = req.params.id as string
        const brokerId = role === 'SUB_BROKER' && brokerIdToken ? brokerIdToken : userId

        const coverage = await updateCoverage(id, brokerId, req.body)

        res.status(200).json({
            message: 'Cobertura actualizada',
            coverage
        })
    }catch(error){
        if(error instanceof Error){
                res.status(400).json({message: error.message})
                return
        }
        res.status(500).json({message: 'Error interno del servidor'})
    }
}

export async function deleteCoverageController(req: Request, res: Response): Promise<void>{
    try{
        const { userId, role, brokerId: brokerIdToken } = req.user!
        const id = req.params.id as string
        const brokerId = role === 'SUB_BROKER' && brokerIdToken ? brokerIdToken : userId

        const result = await deleteCoverage(id, brokerId)
        res.status(200).json(result)
    }catch(error){
        if(error instanceof Error){
            res.status(400).json({message: error.message})
            return
        }
        res.status(500).json({message: 'Error interno del servidor'})
    }
}
