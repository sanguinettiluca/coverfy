import { create } from "domain";
import prisma from "../config/prisma";
import {CreatePolizaDTO, UpdatePolizaDTO, FilterPolizaDTO} from "../domain/poliza";

// Mapeo de tipos: permite construir el objeto de detalle dinamicamente sin tener que hacer
// if o switch, por lo que vi es mejor y mas eficiente.
const detalleCreateMap: Record<string, string> = {
    RESPONSABILIDAD_CIVIL: "detalleResponsabilidadCivil",
    FIANZA:                "detalleFianza",
    VIDA:                  "detalleVida",
    OTROS:                 "detalleOtros",
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
    if(!polizaExistente){
        throw new Error("Ya existe una poliza con ese numero para este cliente");
    }

    const {detalleResponsabilidadCivil, detalleFianza, detalleVida, detalleOtros, ...camposPoliza} = data as any;
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
            detalleOtros: true
        }
    })

    return poliza;
}

export async function listarPolizas(brokerId: string, filtros: FilterPolizaDTO) {
    const { busqueda, pagina = 1, porPagina = 10 } = filtros;
    const where: any = {cliente: {brokerId}};

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
                detalleOtros: true
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
