import { Request, Response } from "express";
import {
    createCompany,
    listCompanies,
    getCompanyById,
    updateCompany,
    deleteCompany,
    reactivateCompany
} from '../services/company.service'

export async function createCompanyController(req: Request, res: Response): Promise<void>{
    try{
        const {userId, role, brokerId: brokerIdToken} = req.user!
        const brokerId = role === 'SUB_BROKER' && brokerIdToken ? brokerIdToken: userId
        const company = await createCompany(req.body, brokerId)
        res.status(201).json({
            message: 'Compañía creada correctamente',
            company
        })
    }catch(error){
        if(error instanceof Error){
            res.status(400).json({ message: error.message })
            return
        }
        res.status(500).json({ message: 'Error interno del servidor' })
    }
}

export async function listCompaniesController(req: Request, res: Response): Promise<void>{
    try{
        const {userId, role, brokerId: brokerIdToken} = req.user!
        const brokerId = role === 'SUB_BROKER' && brokerIdToken ? brokerIdToken : userId

        const companies = await listCompanies(brokerId)
        res.status(200).json(companies)
    }catch(error){
        if(error instanceof Error){
            res.status(400).json({ message: error.message })
            return
        }
        res.status(500).json({ message: 'Error interno del servidor' })
    }
}

export async function getCompanyByIdController(req: Request, res: Response): Promise<void>{
    try{
        const {userId, role, brokerId: brokerIdToken} = req.user!
        const id = req.params.id as string
        const brokerId = role === 'SUB_BROKER' && brokerIdToken ? brokerIdToken : userId

        const company = await getCompanyById(id, brokerId)
        res.status(200).json(company)
    }catch(error){
        if(error instanceof Error){
            res.status(404).json({message: error.message})
            return
        }
        res.status(500).json({ message: 'Error interno del servidor' })
    }
}

export async function updateCompanyController(req: Request, res: Response): Promise<void> {
    try{
        const { userId, role, brokerId: brokerIdToken } = req.user!
        const id = req.params.id as string
        const brokerId = role === 'SUB_BROKER' && brokerIdToken ? brokerIdToken : userId

        const company = await updateCompany(id, brokerId, req.body)
        res.status(200).json({
            message: 'Compañía actualizada correctamente',
            company
        })
    }catch(error){
        if(error instanceof Error){
            res.status(400).json({ message: error.message })
            return
        }
        res.status(500).json({ message: 'Error interno del servidor' })
    }
}

export async function deleteCompanyController(req: Request, res: Response): Promise<void>{
    try{
        const { userId, role, brokerId: brokerIdToken } = req.user!
        const id = req.params.id as string
        const brokerId = role === 'SUB_BROKER' && brokerIdToken ? brokerIdToken : userId

        const result = await deleteCompany(id, brokerId)
        res.status(200).json(result)
    }catch(error){
        if(error instanceof Error){
            res.status(400).json({message: error.message})
            return
        }
        res.status(500).json({ message: 'Error interno del servidor' })
    }
}

export async function reactivateCompanyController(req: Request, res: Response): Promise<void>{
    try{
        const { userId, role, brokerId: brokerIdToken } = req.user!
        const id = req.params.id as string
        const brokerId = role === 'SUB_BROKER' && brokerIdToken ? brokerIdToken : userId

        const company = await reactivateCompany(id, brokerId)
        res.status(200).json({
            message: 'Compañía reactivada correctamente',
            company
        })
    }catch(error){
        if(error instanceof Error){
            res.status(400).json({ message: error.message })
            return
        }
        res.status(500).json({ message: 'Error interno del servidor' })
    }
}