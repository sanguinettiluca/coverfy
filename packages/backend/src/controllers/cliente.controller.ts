import { Request, Response } from "express";
import { 
    crearCliente,
    listarClientes,
    obtenerClientePorId,
    actualizarCliente,
    eliminarCliente
} from "../services/cliente.service";

// Crear cliente
export async function crearClienteController(req: Request, res: Response):  Promise<void>{
    try{
        const { userId, role, brokerId: brokerIdToken } = req.user!
        // Si es SUB_BROKER usa el brokerId de su broker padre
        // Si es BROKER usamos su propio id
        const brokerId = role === 'SUB_BROKER' && brokerIdToken ? brokerIdToken : userId
        const creadoPorId = userId

        const cliente = await crearCliente(req.body, brokerId, creadoPorId)

        res.status(201).json({
            message: 'Cliente creado exitosamente',
            cliente
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
export async function listarClientesController(req: Request, res: Response): Promise<void>{
    try{
        const {userId, role, brokerId: brokerIdToken } = req.user!
        const brokerId = role === 'SUB_BROKER' ? brokerIdToken! : userId
        const filtros = {
            busqueda: req.query.busqueda as string | undefined,
            pagina: req.query.pagina ? Number(req.query.pagina):1,
            porPagina: req.query.porPagina ? Number(req.query.porPagina):10
        }
        const resultado = await listarClientes(brokerId, filtros)
        res.status(200).json(resultado)
    }catch(error){
        if(error instanceof Error){
            res.status(400).json({message: error.message})
            return
        }
        res.status(500).json({message: 'Error interno del servidor'})
    }
}

// Obtener cliente por ID
export async function obtenerClientePorIdController(req: Request, res: Response): Promise<void>{
    try{
        const {userId, role, brokerId: brokerIdToken } = req.user!
        const id = req.params.id as string
        const brokerId = role === 'SUB_BROKER' ? brokerIdToken! : userId
        const cliente = await obtenerClientePorId(id, brokerId)
        res.status(200).json(cliente)
    }catch(error){
        if(error instanceof Error){
            res.status(404).json({message: error.message})
            return
        }
        res.status(500).json({message: 'Error interno del servidor'})
    }
}

// Actualizar cliente
export async function actualizarClienteController(req: Request, res: Response): Promise<void>{
    try{
        const {userId, role, brokerId: brokerIdToken } = req.user!
        const id = req.params.id as string
        const brokerId = role === 'SUB_BROKER' ? brokerIdToken! : userId
        const cliente = await actualizarCliente(id, brokerId, req.body)

        res.status(200).json({
            message: 'Cliente actualizado exitosamente',
            cliente
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
export async function eliminarClienteController(req: Request, res: Response): Promise<void>{
    try{
        const {userId, role, brokerId: brokerIdToken } = req.user!
        const id = req.params.id as string
        const brokerId = role === 'SUB_BROKER' ? brokerIdToken! : userId
        const resultado = await eliminarCliente(id, brokerId)
        res.status(200).json(resultado)
    }catch(error){
        if(error instanceof Error){
            res.status(400).json({message: error.message})
            return
        }
        res.status(500).json({message: 'Error interno del servidor'})
    }
}