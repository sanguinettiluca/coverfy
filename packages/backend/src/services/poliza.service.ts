import prisma from "../config/prisma";
import {CreatePolizaDTO, UpdatePolizaDTO, FilterPolizaDTO} from "../domain/poliza";

export async function crearPoliza(
  data: CreatePolizaDTO,
  brokerId: string
) {
    // Verificamos que el cliente pertenezca al broker
    const cliente = await prisma.cliente.findFirst({
        where: { id: data.clienteId, brokerId }
    })

    if (!cliente) {
        throw new Error('Cliente no encontrado en tu cartera')
    }

    // Verificamos que no exista una póliza con el mismo número para este cliente
    const polizaExistente = await prisma.poliza.findFirst({
        where: { numeroPoliza: data.numeroPoliza, clienteId: data.clienteId }
    })

    if (polizaExistente) {
    throw new Error('Ya existe una póliza con ese número para este cliente')
    }

    const poliza = await prisma.poliza.create({
        data: {
            ...data,
            brokerId
        }
    })

    return poliza
}

export async function listarPolizas(brokerId: string, filtros: FilterPolizaDTO) {
    const {busqueda, pagina = 1, porPagina = 10} = filtros;
    const where: any = { cliente: { brokerId } };

    if(busqueda){
        where.OR = [
            {numeroPoliza: {contains: busqueda, mode: 'insensitive'}},
            {numeroReferencia: {contains: busqueda, mode: 'insensitive'}}
        ]
    }

    const [polizas, total] = await Promise.all([
        prisma.poliza.findMany({
            where,
            skip: (pagina - 1) * porPagina,
            take: porPagina,
            orderBy: {createdAt: 'desc'},
            include: {
                broker:{
                    select: {id: true, nombre: true, role: true}
                }
            }
        }),
        prisma.poliza.count({where})
    ])

    return { polizas, total, pagina, porPagina, totalPaginas: Math.ceil(total / porPagina) }
}

export async function actualizarPoliza(id: string, brokerId: string, data: UpdatePolizaDTO){
    const poliza = await prisma.poliza.findFirst({
        where: { id, cliente: { brokerId } }
    })
    if (!poliza) {
        throw new Error('Póliza no encontrada')
    }

    const polizaActualizada = await prisma.poliza.update({
        where: { id },
        data
    })

    return polizaActualizada;
}

export async function eliminarPoliza(id: string, brokerId: string){
    const poliza = await prisma.poliza.findFirst({
        where: {id, brokerId}
    })
    if (!poliza) {
        throw new Error('Póliza no encontrada')
    }

    await prisma.poliza.delete({
        where: {id}
    })

    return {message: 'Póliza eliminada exitosamente'}
}

export async function obtenerPolizaPorId(id: string, brokerId: string){
    const poliza = await prisma.poliza.findFirst({
        where: { id, cliente: { brokerId } },
        include: {
            broker:{
                select: {id: true, nombre: true, role: true}
            }
        }
    })
    if (!poliza) {
        throw new Error('Póliza no encontrada')
    }

    return poliza;
}


//obtener polizas por numero de poliza o numero de referencia

// export async function obtenerPolizaPorNumero(numeroPoliza: string, brokerId: string){
//     const poliza = await prisma.poliza.findFirst({
//         where: {numeroPoliza, brokerId},
//         include: {
//             creadoPor:{
//                 select: {id: true, nombre: true, role: true}
//             }
//         }
//     })
//     if (!poliza) {
//         throw new Error('Póliza no encontrada')
//     }

//     return poliza;
// }

// export async function obtenerPolizaPorNumeroReferencia(numeroReferencia: string, brokerId: string){
//     const poliza = await prisma.poliza.findFirst({
//         where: {numeroReferencia, brokerId},
//         include: {
//             creadoPor:{
//                 select: {id: true, nombre: true, role: true}
//             }
//         }
//     })
//     if (!poliza) {
//         throw new Error('Póliza no encontrada')
//     }

//     return poliza;
// }
