import prisma from "../config/prisma";
import { CreateQuickMessageDTO, UpdateQuickMessageDTO } from "../domain/quickMessage";

export async function createQuickMessage(data: CreateQuickMessageDTO, brokerId: string){
    const message = await prisma.quickMessage.create({
        data: {
            ...data,
            brokerId
        }
    })

    return message
}

export async function listQuickMessages(brokerId: string){
    const messages = await prisma.quickMessage.findMany({
        where: {brokerId},
        orderBy: {name: 'asc'}
    })

    return messages
}

export async function getQuickMessageById(id: string, brokerId: string){
    const message = await prisma.quickMessage.findFirst({
        where: {id, brokerId}
    })

    if(!message){
        throw new Error("Mensaje no encontrado")
    }

    return message
}

export async function updateQuickMessage(id: string, brokerId: string, data: UpdateQuickMessageDTO) {
    const existingMessage = await prisma.quickMessage.findFirst({
        where: {id, brokerId}
    })

    if(!existingMessage){
        throw new Error("Mensaje no encontrado")
    }

    const updatedMessage = await prisma.quickMessage.update({
        where: {id},
        data
    })

    return updatedMessage
}

export async function deleteQuickMessage(id: string, brokerId: string) {
    const existingMessage = await prisma.quickMessage.findFirst({
        where: {id, brokerId}
    })

    if (!existingMessage) {
        throw new Error('Mensaje rápido no encontrado')
    }

    await prisma.quickMessage.delete({ where: { id } })
}
