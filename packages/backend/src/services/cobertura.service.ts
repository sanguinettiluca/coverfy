import prisma from "../config/prisma";
import { CreateCoberturaDTO, UpdateCoberturaDTO } from "../domain/cobertura";

export async function crearCobertura(data: CreateCoberturaDTO, brokerId: string){
    const compania = await prisma.companiaSeguros.findFirst({
        where: {id: data.companiaId, brokerId}
    })

    if(!compania){
        throw new Error('Compania no encontrada')
    }

    const coberturaExistente = await prisma.cobertura.findFirst({
        where: {
            nombre: data.nombre,
            tipoSeguro: data.tipoSeguro,
            companiaId: data.companiaId
        }
    })

    if(coberturaExistente){
        throw new Error('Ya existe una cobertura con ese nombre para este tipo de seguro')
    }

    const cobertura = await prisma.cobertura.create({
        data:{
            nombre: data.nombre,
            tipoSeguro: data.tipoSeguro,
            companiaId: data.companiaId
        } 
    })

    return cobertura
}

export async function listarCoberturas(companiaId: string, brokerId: string, tipoSeguro?: string) {
    const compania = await prisma.companiaSeguros.findFirst({
        where: {id: companiaId, brokerId}
    })

    if(!compania){
        throw new Error('Compañia no encontrada')
    }

    const coberturas = await prisma.cobertura.findMany({
        where:{
            companiaId
        },
        orderBy: {nombre: 'asc'}
    })

    return coberturas
}

export async function actualizarCobertura(id: string, brokerId: string, data: UpdateCoberturaDTO){
    const cobertura = await prisma.cobertura.findFirst({
        where:{
            id,
            compania: {brokerId}
        }
    })

    if(!cobertura){
        throw new Error('Cobertura no encontrada')
    }

    const coberturaActualizada = await prisma.cobertura.update({
        where: {id},
        data
    })

    return coberturaActualizada
}

export async function eliminarCobertura(id: string, brokerId: string) {
    const cobertura = await prisma.cobertura.findFirst({
        where: {
            id,
            compania: { brokerId }
        }
    })

    if (!cobertura) {
        throw new Error('Cobertura no encontrada')
    }

    await prisma.cobertura.delete({ 
        where: { id } 
    })

    return { message: 'Cobertura eliminada correctamente' }
}