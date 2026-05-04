import prisma from "../config/prisma";
import {CreateClienteDTO, UpdateClienteDTO, FilterClienteDTO} from "../domain/cliente";

// Crear cliente
export async function crearCliente(
    data: CreateClienteDTO,
    brokerId: string,
    creadoPorId: string
){
    const clienteExistente = await prisma.cliente.findFirst({
        where: {documento: data.documento, brokerId}
    })

    if(clienteExistente){
        throw new Error('Ya existe un cliente con ese documento en tu cartera')
    }

    const cliente = await prisma.cliente.create({
        data: {
            ...data,
            brokerId,
            creadoPorId
        }
    })

    return cliente;
}

// Listar clientes
export async function listarClientes(brokerId: string, filtros: FilterClienteDTO) {
    const {busqueda, pagina = 1, porPagina = 10} = filtros;

    // Filtro dinamico de busqueda
    const where: any = {brokerId};

    if(busqueda){
        where.OR = [
            {nombres: {contains: busqueda, mode: 'insensitive'}},
            {apellidos: {contains: busqueda, mode: 'insensitive'}},
            {documento: {contains: busqueda, mode: 'insensitive'}}
        ]
    }

    const [clientes, total] = await Promise.all([
        prisma.cliente.findMany({
            where,
            skip: (pagina - 1) * porPagina,
            take: porPagina,
            orderBy: {createdAt: 'desc'},
            include: {
                creadoPor:{
                    select: {id: true, nombre: true, role: true}
                }
            }
        }),
        prisma.cliente.count({where})
    ])

    return {
        clientes, // Lista de clientes
        total, // Total de clientes que coinciden con el filtro
        pagina, // Página actual
        porPagina, // Cantidad de clientes por página
        totalPaginas: Math.ceil(total / porPagina) // Total de páginas, 
        // el calculo se hace dividiendo el total de clientes por la cantidad por página y redondeando hacia arriba
    }
}

// Obtener cliente por ID
export async function obtenerClientePorId(id: string, brokerId: string){
    const cliente = await prisma.cliente.findFirst({
        where: {id, brokerId},
        include: {
            creadoPor:{
                select: {id:true, nombre:true, role:true}
            },
            polizas: {
                orderBy: {createdAt: 'desc'},
            }
        }
    })

    if(!cliente){
        throw new Error('Cliente no encontrado')
    }

    return cliente;
}

// Actualizar cliente
export async function actualizarCliente(id: string, brokerId: string, data: UpdateClienteDTO) {
    const cliente = await prisma.cliente.findFirst({
        where: {id, brokerId}
    })

    if(!cliente){
        throw new Error('Cliente no encontrado')
    }

    const clienteActualizado = await prisma.cliente.update({
        where: {id},
        data
    })

    return clienteActualizado;
}

// Eliminar cliente
export async function eliminarCliente(id: string, brokerId: string) {
    const cliente = await prisma.cliente.findFirst({
        where: {id, brokerId}
    })

    if(!cliente){
        throw new Error('Cliente no encontrado')
    }

    await prisma.cliente.delete({ where: {id} })

    return {message: 'Cliente eliminado exitosamente'};
}