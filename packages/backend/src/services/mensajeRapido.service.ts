import prisma from "../config/prisma";
import { CreateMensajeRapidoDTO, UpdateMensajeRapidoDTO } from "../domain/mensajeRapido";

export async function crearMensajeRapido(data: CreateMensajeRapidoDTO, brokerId: string){
    const mensaje = await prisma.mensajeRapido.create({
        data: {
            ...data,
            brokerId
        }
    })

    return mensaje
}

export async function listarMensajesRapidos(brokerId: string){
    const mensajes = await prisma.mensajeRapido.findMany({
        where: {brokerId},
        orderBy: {nombre: 'asc'}
    })

    return mensajes
}

export async function obtenerMensajeRapidoPorId(id: string, brokerId: string){
    const mensaje = await prisma.mensajeRapido.findFirst({
        where: {id, brokerId}
    })

    if(!mensaje){
        throw new Error("Mensaje no encontrado")
    }

    return mensaje
}

export async function actualizarMensajeRapido(id: string, brokerId: string, data: UpdateMensajeRapidoDTO) {
    const mensajeExistente = await prisma.mensajeRapido.findFirst({
        where: {id, brokerId}
    })

    if(!mensajeExistente){
        throw new Error("Mensaje no encontrado")
    }

    const mensajeActualizado = await prisma.mensajeRapido.update({
        where: {id},
        data
    })

    return mensajeActualizado
}

export async function eliminarMensajeRapido(id: string, brokerId: string) {
    const mensajeExistente = await prisma.mensajeRapido.findFirst({
        where: {id, brokerId}
    })

    if (!mensajeExistente) {
        throw new Error('Mensaje rápido no encontrado')
    }

    await prisma.mensajeRapido.delete({ where: { id } })
}