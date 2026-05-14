import prisma from '../config/prisma';
import { CreateDetalleAlquilerDTO, UpdateDetalleAlquilerDTO } from '../domain/detalleAlquiler';

export async function crearDetalleAlquiler(data: CreateDetalleAlquilerDTO, polizaId: string, alquilerId: string) {

    const poliza = await prisma.poliza.findUnique({
        where: {id: polizaId}
    })

    if (!poliza) {
        throw new Error('Póliza no encontrada')
    }

    const detalleAlquiler = await prisma.detalleAlquiler.create({
        data: {
            ...data,
            polizaId,
            alquilerId
        }
    })

    return detalleAlquiler;
}

export async function actualizarDetalleAlquiler(id: string, data: UpdateDetalleAlquilerDTO, polizaId: string, alquilerId: string) {
    const detalleAlquiler = await prisma.detalleAlquiler.findFirst({
        where: {id, polizaId, alquilerId}
    })
    if (!detalleAlquiler) {
        throw new Error('Detalle de alquiler no encontrado')
    }
    const detalleAlquilerActualizado = await prisma.detalleAlquiler.update({
        where: {id},
        data: {
            ...data,
            polizaId,
            alquilerId
        }
    })
    return detalleAlquilerActualizado;
}