import { Request, Response } from "express";
import {
    createClient,
    listClients,
    getClientById,
    updateClient,
    deleteClient,
    findClientByDocument,
    reactivateClient
} from "../services/client.service";

// Crear cliente
export async function createClientController(req: Request, res: Response):  Promise<void>{
    try{
        const { userId, role, brokerId: brokerIdToken } = req.user!
        // Si es SUB_BROKER usa el brokerId de su broker padre
        // Si es BROKER usamos su propio id
        const brokerId = role === 'SUB_BROKER' && brokerIdToken ? brokerIdToken : userId
        const createdById = userId

        const client = await createClient(req.body, brokerId, createdById)

        res.status(201).json({
            message: 'Cliente creado exitosamente',
            client
        })
    }catch(error){
        if (error instanceof Error) {
            res.status(400).json({message: error.message})
            return
        }
        res.status(500).json({message: 'Error interno del servidor'})
    }
}

// Listar clientes
export async function listClientsController(req: Request, res: Response): Promise<void>{
    try{
        const {userId, role, brokerId: brokerIdToken } = req.user!
        const brokerId = role === 'SUB_BROKER' ? brokerIdToken! : userId
        const filters = {
            search: req.query.search as string | undefined,
            page: req.query.page ? Number(req.query.page):1,
            perPage: req.query.perPage ? Number(req.query.perPage):10
        }
        const result = await listClients(brokerId, filters)
        res.status(200).json(result)
    }catch(error){
        if(error instanceof Error){
            res.status(400).json({message: error.message})
            return
        }
        res.status(500).json({message: 'Error interno del servidor'})
    }
}

// Obtener cliente por ID
export async function getClientByIdController(req: Request, res: Response): Promise<void>{
    try{
        const {userId, role, brokerId: brokerIdToken } = req.user!
        const id = req.params.id as string
        const brokerId = role === 'SUB_BROKER' ? brokerIdToken! : userId
        const client = await getClientById(id, brokerId)
        res.status(200).json(client)
    }catch(error){
        if(error instanceof Error){
            res.status(404).json({message: error.message})
            return
        }
        res.status(500).json({message: 'Error interno del servidor'})
    }
}

// Actualizar cliente
export async function updateClientController(req: Request, res: Response): Promise<void>{
    try{
        const {userId, role, brokerId: brokerIdToken } = req.user!
        const id = req.params.id as string
        const brokerId = role === 'SUB_BROKER' ? brokerIdToken! : userId
        const client = await updateClient(id, brokerId, req.body)

        res.status(200).json({
            message: 'Cliente actualizado exitosamente',
            client
        })
    }catch(error){
        if (error instanceof Error) {
            res.status(400).json({ message: error.message })
            return
        }
        res.status(500).json({ message: 'Error interno del servidor' })
    }
}

// Eliminar cliente
export async function deleteClientController(req: Request, res: Response): Promise<void>{
    try{
        const {userId, role, brokerId: brokerIdToken } = req.user!
        const id = req.params.id as string
        const brokerId = role === 'SUB_BROKER' ? brokerIdToken! : userId
        const result = await deleteClient(id, brokerId)
        res.status(200).json(result)
    }catch(error){
        if(error instanceof Error){
            res.status(400).json({message: error.message})
            return
        }
        res.status(500).json({message: 'Error interno del servidor'})
    }
}

export async function findClientByDocumentController(req:Request<{ documentNumber: string }>, res: Response): Promise<void> {
    try{
        const {userId, role, brokerId: brokerIdToken} = req.user!
        const brokerId = role === 'SUB_BROKER' && brokerIdToken ? brokerIdToken:userId

        const {documentNumber} = req.params

        const client = await findClientByDocument(documentNumber, brokerId)

        res.status(200).json(client)
    }catch(error){
        if (error instanceof Error) {
            res.status(404).json({ message: error.message })
            return
        }
        res.status(500).json({ message: "Error interno" })
    }
}

export async function reactivateClientController(req: Request, res: Response): Promise<void> {
    try{
        const {userId, role, brokerId: brokerIdToken} = req.user!
        const id = req.params.id as string
        const brokerId = role === 'SUB_BROKER' && brokerIdToken ? brokerIdToken:userId
        const client = await reactivateClient(id, brokerId)

        res.status(200).json({
            message: 'Cliente reactivado exitosamente',
            client
        })
    }catch(error){
        if (error instanceof Error) {
            res.status(400).json({ message: error.message })
            return
        }
        res.status(500).json({ message: 'Error interno del servidor' })
    }
}