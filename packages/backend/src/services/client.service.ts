import prisma from "../config/prisma";
import {CreateClientDTO, UpdateClientDTO, FilterClientDTO} from "../domain/client";

// Crear cliente
export async function createClient(
    data: CreateClientDTO,
    brokerId: string,
    createdById: string
){
    const existingClient = await prisma.client.findFirst({
        where: {documentNumber: data.documentNumber, brokerId, isActive: true}
    })

    if(existingClient){
        throw new Error('Ya existe un cliente con ese documento en tu cartera')
    }

    const client = await prisma.client.create({
        data: {
            ...data,
            brokerId,
            createdById
        }
    })

    return client;
}

// Listar clientes
export async function listClients(brokerId: string, filters: FilterClientDTO) {
    const {search, page = 1, perPage = 10} = filters;

    // Filtro dinamico de busqueda
    const where: any = {brokerId};

    if(search){
        where.OR = [
            {firstName: {contains: search, mode: 'insensitive'}},
            {lastName: {contains: search, mode: 'insensitive'}},
            {documentNumber: {contains: search, mode: 'insensitive'}}
        ]
    }

    const [clients, total] = await Promise.all([
        prisma.client.findMany({
            where,
            skip: (page - 1) * perPage,
            take: perPage,
            orderBy: {createdAt: 'desc'},
            include: {
                createdBy:{
                    select: {id: true, name: true, role: true}
                }
            }
        }),
        prisma.client.count({where})
    ])

    return {
        clients, // Lista de clientes
        total, // Total de clientes que coinciden con el filtro
        page, // Página actual
        perPage, // Cantidad de clientes por página
        totalPages: Math.ceil(total / perPage) // Total de páginas,
        // el calculo se hace dividiendo el total de clientes por la cantidad por página y redondeando hacia arriba
    }
}

// Obtener cliente por ID
export async function getClientById(id: string, brokerId: string){
    const client = await prisma.client.findFirst({
        where: {id, brokerId},
        include: {
            createdBy:{
                select: {id:true, name:true, role:true}
            },
            policies: {
                orderBy: {createdAt: 'desc'},
            }
        }
    })

    if(!client){
        throw new Error('Cliente no encontrado')
    }

    return client;
}

// Actualizar cliente
export async function updateClient(id: string, brokerId: string, data: UpdateClientDTO) {
    const client = await prisma.client.findFirst({
        where: {id, brokerId}
    })

    if(!client){
        throw new Error('Cliente no encontrado')
    }

    const updatedClient = await prisma.client.update({
        where: {id},
        data
    })

    return updatedClient;
}

// Eliminar cliente
export async function deleteClient(id: string, brokerId: string) {
    const client = await prisma.client.findFirst({
        where: {id, brokerId}
    })

    if(!client){
        throw new Error('Cliente no encontrado')
    }
    // el cliente y todas sus polizas se desactivan juntos, las polizas pasan a tener como status CANCELLED
    await prisma.$transaction([
        prisma.client.update({
            where: {id},
            data: {isActive: false}
        }),
        prisma.policy.updateMany({
            where: {clientId: id},
            data: {isActive: false, status: 'CANCELLED'}
        })
    ])

    return {message: 'Cliente eliminado exitosamente'};
}

export async function reactivateClient(id: string, brokerId: string){
    const client = await prisma.client.findFirst({
        where: {id, brokerId}
    })

    if(!client){
        throw new Error('Cliente no encontrado')
    }

    const reactivatedClient = await prisma.client.update({
        where: {id},
        data: {isActive: true}
    })

    return reactivatedClient;
}

export async function findClientByDocument(documentNumber: string, brokerId: string){
    const client = await prisma.client.findFirst({
        where: {documentNumber, brokerId}
    })

    if(!client){
        throw new Error('No se encontro ningun cliente con ese numero de documento')
    }

    return client
}
