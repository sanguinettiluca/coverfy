import prisma from "../config/prisma";
import {CreatePolizaDTO, UpdatePolizaDTO, FilterPolizaDTO} from "../domain/poliza";

export async function crearPoliza(data: CreatePolizaDTO, brokerId: string){
    const polizaExistente = await prisma.poliza.findFirst({
        where: {numeroPoliza: data.numeroPoliza, brokerId}
    })

    if (polizaExistente) {
        throw new Error('Ya existe una póliza con ese número')
    }

    const poliza = await prisma.poliza.create({
        data: {
            ...data,
            brokerId
        }
    })

    return poliza;
}

export async function listarPolizas(brokerId: string, filtros: FilterPolizaDTO) {
    const {busqueda, pagina = 1, porPagina = 10} = filtros;
    const where: any = {brokerId};

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
                creadoPor:{
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
        where: {id, brokerId}
    })
    if (!poliza) {
        throw new Error('Póliza no encontrada')
    }

    const polizaActualizada = await prisma.poliza.update({
        where: {id, brokerId},
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
        where: {id, brokerId},
        include: {
            creadoPor:{
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
