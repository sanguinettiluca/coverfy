import prisma from "../config/prisma";
import { CreateSiniestroDTO, UpdateSiniestroDTO, FilterSiniestroDTO } from "../domain/siniestro";

// Para mostrar los datos de la poliza asociada al siniestro.
const siniestrosInclude = {
    poliza: {
        include: {
            cliente: { select: { id: true, nombres: true, apellidos: true } },
            detalleVehiculo: true
        }
    }
};

export async function createSiniestro(data: CreateSiniestroDTO, brokerId: string){
    const poliza = await prisma.poliza.findFirst({
        where: {id: data.polizaId, cliente: { brokerId}}
    });

    if (!poliza){
        throw new Error("Poliza no encontrada en tu cartera.");
    }

    // Solo las polizas de vehiculos pueden registrar siniestros por eso el filtro.
    if(poliza.tipoSeguro !== "VEHICULO"){
        throw new Error("Solo las polizas de vehiculo pueden registrar siniestros.")
    }

    const siniestro = await prisma.siniestro.create({
        data: {
            polizaId: data.polizaId,
            fechaSiniestro: data.fechaSiniestro,
            fechaContacto: data.fechaContacto,
            notas: data.notas,
            brokerId
        },
        include: siniestrosInclude
    });

    return siniestro;
}

export async function listarSiniestros(brokerId: string, filtros: FilterSiniestroDTO){
    const { estado, busqueda, pagina = 1, porPagina = 10 } = filtros;

    const where: any = {
        broker: { id: brokerId },
        poliza: { cliente: {brokerId } }
    };

    if(estado){
        where.estado = estado;
    }

    if (busqueda){
        where.poliza = {
            ...where.poliza,
            OR: [
                { numeroPoliza: { contains: busqueda, mode: "insensitive"} },
                { detalleVehiculo: { matricula: {contains: busqueda, mode: "insensitive"}}},
                {detalleVehiculo: {modelo: {contains: busqueda, mode: "insensitive"}}},
                {detalleVehiculo: { modelo: {contains: busqueda, mode: "insensitive"}}}
            ]
        }
    };

    const [siniestros, total] = await Promise.all([
        prisma.siniestro.findMany({
            where,
            skip: (pagina - 1) * porPagina,
            take: porPagina,
            orderBy: {createdAt: "desc"},
            include: siniestrosInclude
        }),
        prisma.siniestro.count({where})
    ]);

    return {siniestros, total, pagina, porPagina, totalPaginas: Math.ceil(total / porPagina)};
}

export async function obtenerSiniestrosPorId(id: string, brokerId: string){
    const siniestro = await prisma.siniestro.findFirst({
        where: {id, poliza: {cliente:{brokerId}}},
        include: siniestrosInclude
    });

    if(!siniestro){
        throw new Error("Siniestro no encontrado.");
    };

    return siniestro;
}

export async function actualizarSiniestro(id: string, brokerId: string, data: UpdateSiniestroDTO){
    const siniestro =await prisma.siniestro.findFirst({
        where: {id, poliza: {cliente: {brokerId}}}
    });

    if(!siniestro){
        throw new Error("Siniestro no encontrado.");
    }

    return prisma.siniestro.update({
        where: {id},
        data,
        include: siniestrosInclude
    });
}

export async function eliminarSiniestro(id: string, brokerId: string){
    const siniestro = await prisma.siniestro.findFirst({
        where: {id, poliza: {cliente: {brokerId}}}
    });

    if(!siniestro){
        throw new Error("Siniestro no encontrado.");
    }

    await prisma.siniestro.delete({
        where: {id}
    });
    
    return {message: "Siniestro eliminado exitosamente"};
}