import { create } from "domain";
import prisma from "../config/prisma";
import {CreatePolizaDTO, UpdatePolizaDTO, FilterPolizaDTO} from "../domain/poliza";

// Mapeo de tipos: permite construir el objeto de detalle dinamicamente sin tener que hacer
// if o switch, por lo que vi es mejor y mas eficiente.
const detalleCreateMap: Record<string, string> = {
    RESPONSABILIDAD_CIVIL: "detalleResponsabilidadCivil",
    FIANZA: "detalleFianza",
    VIDA: "detalleVida",
    OTROS: "detalleOtros",
    ALQUILER: "detalleAlquiler",
    COMERCIO: "detalleComercio",
    HOGAR: "detalleHogar",
    VEHCIULO: "detalleVehiculo",
    VIAJE: "detalleViaje"
}

// Extrae el detalle del body segun el tipo del seguro (tipoSeguro) y lo retorna
// como objeto o undefined si el tipo no tiene detalle registrado (no deberia pasar nunca).
function buildDetalleCreate(data: CreatePolizaDTO): Record<string, unknown> | undefined{
    const claveDetalle = detalleCreateMap[data.tipoSeguro];

    if(!claveDetalle){
        return undefined;
    }

    const camposDetalle = (data as any)[claveDetalle];
    if(!camposDetalle){
        return undefined;
    }

    return { [claveDetalle]: { create: camposDetalle } };
}

export async function crearPoliza(data: CreatePolizaDTO, brokerId: string){
    const cliente = await prisma.cliente.findFirst({
        where: {id: data.clienteId, brokerId}
    });
    if(!cliente){
        throw new Error("Cliente no encontrado en tu cartera");
    }

    const polizaExistente = await prisma.poliza.findFirst({
        where: {numeroPoliza: data.numeroPoliza, clienteId: data.clienteId}
    });
    if(polizaExistente){
        throw new Error("Ya existe una poliza con ese numero para este cliente");
    }

    const {
        detalleResponsabilidadCivil,
        detalleFianza, 
        detalleVida, 
        detalleOtros,
        detalleAlquiler,
        detalleComercio,
        detalleHogar,
        detalleVehiculo,
        detalleViaje,
        ...camposPoliza
    } = data as any;
    const detalle = buildDetalleCreate(data);
    const poliza = await prisma.poliza.create({
        data: {
            ...camposPoliza,
            brokerId,
            ...detalle
        },
        include: {
            detalleResponsabilidadCivil: true,
            detalleFianza: true,
            detalleVida: true,
            detalleOtros: true,
            detalleAlquiler: true,
            detalleComercio: true,
            detalleHogar: true,
            detalleVehiculo: true,
            detalleViaje: true
        }
    })

    return poliza;
}

export async function listarPolizas(brokerId: string, filtros: FilterPolizaDTO) {
    const { busqueda, clienteId, pagina = 1, porPagina = 10 } = filtros;
    const where: any = {cliente: {brokerId}};

    if(clienteId){
        where.clienteId = clienteId;
    }

    if(busqueda){
        where.OR = [
            {numeroPoliza: {contains: busqueda, mode: "insensitive"}},
            {numeroReferencia: {contains: busqueda, mode: "insensitive"}}
        ];
    }

    const [polizas, total] = await Promise.all([
        prisma.poliza.findMany({
            where,
            skip: (pagina-1) * porPagina,
            take: porPagina,
            orderBy: {createdAt: "desc"},
            include:{
                broker: {select: {id: true, nombre: true, role: true}},
                detalleResponsabilidadCivil: true,
                detalleFianza: true,
                detalleVida: true,
                detalleOtros: true,
                detalleAlquiler: true,
                detalleComercio: true,
                detalleHogar: true,
                detalleVehiculo: true,
                detalleViaje: true
            }
        }),
        prisma.poliza.count({where}),
    ]);

    return { 
        polizas, 
        total, 
        pagina, 
        porPagina, 
        totalPaginas: Math.ceil(total / porPagina) 
    };
}

export async function actualizarPoliza(id: string, brokerId: string, data: UpdatePolizaDTO){
    const poliza = await prisma.poliza.findFirst({
        where: { id, cliente: { brokerId } }
    })
    if (!poliza) {
        throw new Error('Póliza no encontrada')
    }

    const {
        detalleResponsabilidadCivil,
        detalleFianza,
        detalleVida,
        detalleOtros,
        detalleAlquiler,
        detalleComercio,
        detalleHogar,
        detalleVehiculo,
        detalleViaje,
        ...camposBase
    } = data;

    // string: las claves vienen en forma de texto, unknown: el valor puede ser cualquier cosa
    // luego se le iran asignando propiedades segun que detalle venga en el request
    const detallesUpdate: Record<string, unknown> = {};

    // Si existe detalleResponsabilidadCivil en los datos de UpdatePolizaDTO entonces se agrega
    // para actualizarlo.
    if(detalleResponsabilidadCivil){
        // Se agrega dinamicamente la propiedad detalle... a detallesUpdate.
        // detallesUpdate = {
        //   detalleResponsabilidadCivil: {...}
        // } -- Espero se entienda esto
        detallesUpdate.detalleResponsabilidadCivil = {
            upsert: {create: detalleResponsabilidadCivil, update: detalleResponsabilidadCivil}
        }
    }

    if(detalleFianza){
        detallesUpdate.detalleFianza = {
            upsert: {create: detalleFianza, update: detalleFianza}
        }
    }

    if(detalleVida){
        detallesUpdate.detalleVida = {
            upsert: {create: detalleVida, update: detalleVida}
        }
    }

    if(detalleOtros){
        detallesUpdate.detalleOtros = {
            upsert: {create: detalleOtros, update: detalleOtros}
        }
    }

    if(detalleViaje){
        detallesUpdate.detalleViaje = {
            upsert: {create: detalleViaje, update: detalleViaje}
        }
    }

    if(detalleAlquiler){
        detallesUpdate.detalleAlquiler = {
            upsert: {create: detalleAlquiler, update: detalleAlquiler}
        }
    }

    if(detalleComercio){
        detallesUpdate.detalleComercio = {
            upsert: {create: detalleComercio, update: detalleComercio}
        }
    }

    if(detalleHogar){
        detallesUpdate.detalleHogar = {
            upsert: {create: detalleHogar, update: detalleHogar}
        }
    }

    if(detalleVehiculo){
        detallesUpdate.detalleVehiculo = {
            upsert: {create: detalleVehiculo, update: detalleVehiculo}
        }
    }

    const polizaActualizada = await prisma.poliza.update({
        where: {id},
        data: {...camposBase, ...detallesUpdate},
        include: {
            detalleResponsabilidadCivil: true,
            detalleFianza: true,
            detalleVida: true,
            detalleOtros: true,
            detalleAlquiler: true,
            detalleComercio: true,
            detalleHogar: true,
            detalleVehiculo: true,
            detalleViaje: true
        }
    });
    return polizaActualizada
}

export async function eliminarPoliza(id: string, brokerId: string){
    const poliza = await prisma.poliza.findFirst({
        where: {id, brokerId}
    })

    if(!poliza){
        throw new Error("Poliza no encontrada");
    }

    await prisma.poliza.delete({where: {id}});
    return {message: "Poliza eliminada exitosamente"};
}

export async function obtenerPolizaPorId(id: string, brokerId: string){
    const poliza = await prisma.poliza.findFirst({
        where: {id, cliente: {brokerId}},
        include: {
            broker: { select: { id: true, nombre: true, role: true } },
            detalleResponsabilidadCivil: true,
            detalleFianza: true,
            detalleVida: true,
            detalleOtros: true,
            detalleAlquiler: true,
            detalleComercio: true,
            detalleHogar: true,
            detalleVehiculo: true,
            detalleViaje: true
        }
    })

    if(!poliza){
        throw new Error("Poliza no encontrada")
    }

    return poliza
}