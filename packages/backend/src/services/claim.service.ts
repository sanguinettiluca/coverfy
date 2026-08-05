import prisma from "../config/prisma";
import { CreateClaimDTO, UpdateClaimDTO, FilterClaimDTO } from "../domain/claim";

// Para mostrar los datos de la poliza asociada al siniestro.
const claimsInclude = {
    policy: {
        include: {
            client: { select: { id: true, firstName: true, lastName: true } },
            vehicleDetails: true
        }
    }
};

export async function createClaim(data: CreateClaimDTO, brokerId: string){
    const policy = await prisma.policy.findFirst({
        where: {id: data.policyId, client: { brokerId}}
    });

    if (!policy){
        throw new Error("Poliza no encontrada en tu cartera.");
    }

    // Solo las polizas de vehiculos pueden registrar siniestros por eso el filtro.
    if(policy.insuranceType !== "VEHICLE"){
        throw new Error("Solo las polizas de vehiculo pueden registrar siniestros.")
    }

    const claim = await prisma.claim.create({
        data: {
            policyId: data.policyId,
            incidentDate: data.incidentDate,
            contactDate: data.contactDate,
            notes: data.notes,
            brokerId
        },
        include: claimsInclude
    });

    return claim;
}

export async function listClaims(brokerId: string, filters: FilterClaimDTO){
    const { status, search, page = 1, perPage = 10 } = filters;

    const where: any = {
        broker: { id: brokerId },
        policy: { client: {brokerId } }
    };

    if(status){
        where.status = status;
    }

    if (search){
        where.policy = {
            ...where.policy,
            OR: [
                { policyNumber: { contains: search, mode: "insensitive"} },
                { referenceNumber: { contains: search, mode: "insensitive"} },
                { vehicleDetails: { licensePlate: {contains: search, mode: "insensitive"}}},
                {vehicleDetails: { model: {contains: search, mode: "insensitive"}}}
            ]
        }
    };

    const [claims, total] = await Promise.all([
        prisma.claim.findMany({
            where,
            skip: (page - 1) * perPage,
            take: perPage,
            orderBy: {createdAt: "desc"},
            include: claimsInclude
        }),
        prisma.claim.count({where})
    ]);

    return {claims, total, page, perPage, totalPages: Math.ceil(total / perPage)};
}

export async function getClaimById(id: string, brokerId: string){
    const claim = await prisma.claim.findFirst({
        where: {id, policy: {client:{brokerId}}},
        include: claimsInclude
    });

    if(!claim){
        throw new Error("Siniestro no encontrado.");
    };

    return claim;
}

export async function updateClaim(id: string, brokerId: string, data: UpdateClaimDTO){
    const claim = await prisma.claim.findFirst({
        where: {id, policy: {client: {brokerId}}}
    });

    if(!claim){
        throw new Error("Siniestro no encontrado.");
    }

    return prisma.claim.update({
        where: {id},
        data,
        include: claimsInclude
    });
}

export async function deleteClaim(id: string, brokerId: string){
    const claim = await prisma.claim.findFirst({
        where: {id, policy: {client: {brokerId}}}
    });

    if(!claim){
        throw new Error("Siniestro no encontrado.");
    }

    await prisma.claim.delete({
        where: {id}
    });

    return {message: "Siniestro eliminado exitosamente"};
}
