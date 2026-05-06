import prisma from "../config/prisma";
import { CreateCompaniaDTO, UpdateCompaniaDTO } from "../domain/compania";

export async function crearCompania(data: CreateCompaniaDTO, brokerId: string) {
    // Verificar si no existe una compañía con el mismo nombre para el mismo broker
    const companiaExistente = await prisma.companiaSeguros.findFirst({
        where: { nombre: data.nombre, brokerId }
    })

    if (companiaExistente) {
        throw new Error("Ya existe una compañía con ese nombre.");
    }

    const compania = await prisma.companiaSeguros.create({
        data: {nombre: data.nombre, brokerId}
    })

    return compania;
}

export async function listarCompanias(brokerId: string) {
    const companias = await prisma.companiaSeguros.findMany({
        where: { brokerId },
        include: {
            coberturas: {
                orderBy: { tipoSeguro: "asc"}
            }
        },
        orderBy: { nombre: "asc" }
    })

    return companias;
}

export async function obtenerCompaniaPorId(id: string, brokerId: string){
    const compania = await prisma.companiaSeguros.findFirst({
        where: {id, brokerId},
        include: {
            coberturas: {
                orderBy: { tipoSeguro: "asc"}
            }
        }
    })

    if (!compania) {
        throw new Error("Compañía no encontrada.");
    }

    return compania;
}

export async function actualizarCompania(id: string, brokerId: string, data: UpdateCompaniaDTO) {
    const compania = await prisma.companiaSeguros.findFirst({
        where: {id, brokerId}
    })

    if(!compania){
        throw new Error("Compañía no encontrada.");
    }

    const companiaActualizada = await prisma.companiaSeguros.update({
        where: {id},
        data
    })

    return companiaActualizada;
}

export async function eliminarCompania(id: string, brokerId: string){
    const compania = await prisma.companiaSeguros.findFirst({
        where: {id, brokerId}
    })

    if(!compania){
        throw new Error("Compañía no encontrada.");
    }

    await prisma.companiaSeguros.delete({
        where: {id}
    })

    return { message: "Compañía eliminada exitosamente." };
}