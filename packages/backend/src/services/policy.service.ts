import prisma from "../config/prisma";
import {CreatePolicyDTO, UpdatePolicyDTO, FilterPolicyDTO} from "../domain/policy";

// Mapeo de tipos: permite construir el objeto de detalle dinamicamente sin tener que hacer
// if o switch, por lo que vi es mejor y mas eficiente.
const detailsCreateMap: Record<string, string> = {
    LIABILITY: "liabilityDetails",
    BOND: "bondDetails",
    LIFE: "lifeDetails",
    OTHER: "otherDetails",
    RENTAL: "rentalDetails",
    BUSINESS: "businessDetails",
    HOME: "homeDetails",
    VEHICLE: "vehicleDetails",
    TRIP: "tripDetails"
}

// Extrae el detalle del body segun el tipo del seguro (insuranceType) y lo retorna
// como objeto o undefined si el tipo no tiene detalle registrado (no deberia pasar nunca).
function buildDetailsCreate(data: CreatePolicyDTO): Record<string, unknown> | undefined{
    const detailsKey = detailsCreateMap[data.insuranceType];
    if(!detailsKey){
        return undefined;
    }
    const detailsFields = (data as any)[detailsKey];
    if(!detailsFields){
        return undefined;
    }
    return { [detailsKey]: { create: detailsFields } };
}

export async function createPolicy(data: CreatePolicyDTO, brokerId: string, createdByUserId: string){
    const client = await prisma.client.findFirst({
        where: {id: data.clientId, brokerId}
    });
    if(!client){
        throw new Error("Cliente no encontrado en tu cartera");
    }

    const existingPolicy = await prisma.policy.findFirst({
        where: {policyNumber: data.policyNumber, clientId: data.clientId, isActive: true}
    });
    if(existingPolicy){
        throw new Error("Ya existe una poliza con ese numero para este cliente");
    }

    const {
        liabilityDetails,
        bondDetails,
        lifeDetails,
        otherDetails,
        rentalDetails,
        businessDetails,
        homeDetails,
        vehicleDetails,
        tripDetails,
        clientId,
        companyId,
        coverageId,
        ...policyFields
    } = data as any;
    const details = buildDetailsCreate(data);
    const policy = await prisma.policy.create({
        data: {
            ...policyFields,
            client: { connect: { id: clientId } },
            company: { connect: { id: companyId } },
            ...(coverageId ? { coverage: { connect: { id: coverageId } } } : {}),
            broker: { connect: { id: createdByUserId } },
            ...details
        },
        include: {
            liabilityDetails: true,
            bondDetails: true,
            lifeDetails: true,
            otherDetails: true,
            rentalDetails: true,
            businessDetails: true,
            homeDetails: true,
            vehicleDetails: true,
            tripDetails: true
        }
    })

    return policy;
}

export async function listPolicies(brokerId: string, filters: FilterPolicyDTO) {
    const { search, clientId, companyId, status, page = 1, perPage = 10 } = filters;
    const where: any = {client: {brokerId}};

    if(clientId){
        where.clientId = clientId;
    }

    if(companyId){
        where.companyId = companyId;
    }

    if(status){
        where.status = status;
    }

    if(search){
        where.OR = [
            {policyNumber: {contains: search, mode: "insensitive"}},
            {referenceNumber: {contains: search, mode: "insensitive"}},
            {vehicleDetails: {licensePlate: {contains: search, mode: 'insensitive'}}}
        ];
    }

    const [policies, total] = await Promise.all([
        prisma.policy.findMany({
            where,
            skip: (page-1) * perPage,
            take: perPage,
            orderBy: {createdAt: "desc"},
            include:{
                broker: { select: {id: true, name: true, role: true} },
                company: { select: {id: true, name: true} },
                client: { select: {id: true, firstName: true, lastName: true} },
                liabilityDetails: true,
                bondDetails: true,
                lifeDetails: true,
                otherDetails: true,
                rentalDetails: true,
                businessDetails: true,
                homeDetails: true,
                vehicleDetails: true,
                tripDetails: true
            }
        }),
        prisma.policy.count({where}),
    ]);

    return {
        policies,
        total,
        page,
        perPage,
        totalPages: Math.ceil(total / perPage)
    };
}

export async function updatePolicy(id: string, brokerId: string, data: UpdatePolicyDTO){
    const policy = await prisma.policy.findFirst({
        where: { id, client: { brokerId } }
    })
    if (!policy) {
        throw new Error('Póliza no encontrada')
    }

    const {
        liabilityDetails,
        bondDetails,
        lifeDetails,
        otherDetails,
        rentalDetails,
        businessDetails,
        homeDetails,
        vehicleDetails,
        tripDetails,
        ...baseFields
    } = data;
    // string: las claves vienen en forma de texto, unknown: el valor puede ser cualquier cosa
    // luego se le iran asignando propiedades segun que detalle venga en el request
    const detailsUpdate: Record<string, unknown> = {};
    // Si existe liabilityDetails en los datos de UpdatePolicyDTO entonces se agrega
    // para actualizarlo.
    if(liabilityDetails){
        // Se agrega dinamicamente la propiedad detalle... a detailsUpdate.
        // detailsUpdate = {
        //   liabilityDetails: {...}
        // } -- Espero se entienda esto
        detailsUpdate.liabilityDetails = {
            upsert: {create: liabilityDetails, update: liabilityDetails}
        }
    }
    if(bondDetails){
        detailsUpdate.bondDetails = {
            upsert: {create: bondDetails, update: bondDetails}
        }
    }
    if(lifeDetails){
        detailsUpdate.lifeDetails = {
            upsert: {create: lifeDetails, update: lifeDetails}
        }
    }
    if(otherDetails){
        detailsUpdate.otherDetails = {
            upsert: {create: otherDetails, update: otherDetails}
        }
    }
    if(tripDetails){
        detailsUpdate.tripDetails = {
            upsert: {create: tripDetails, update: tripDetails}
        }
    }
    if(rentalDetails){
        detailsUpdate.rentalDetails = {
            upsert: {create: rentalDetails, update: rentalDetails}
        }
    }
    if(businessDetails){
        detailsUpdate.businessDetails = {
            upsert: {create: businessDetails, update: businessDetails}
        }
    }
    if(homeDetails){
        detailsUpdate.homeDetails = {
            upsert: {create: homeDetails, update: homeDetails}
        }
    }
    if(vehicleDetails){
        detailsUpdate.vehicleDetails = {
            upsert: {create: vehicleDetails, update: vehicleDetails}
        }
    }

    const updatedPolicy = await prisma.policy.update({
        where: {id},
        data: {...baseFields, ...detailsUpdate},
        include: {
            liabilityDetails: true,
            bondDetails: true,
            lifeDetails: true,
            otherDetails: true,
            rentalDetails: true,
            businessDetails: true,
            homeDetails: true,
            vehicleDetails: true,
            tripDetails: true
        }
    });

    return updatedPolicy
}

export async function deletePolicy(id: string, brokerId: string){
    const policy = await prisma.policy.findFirst({
        where: {id, client: {brokerId}}
    })
    if(!policy){
        throw new Error("Poliza no encontrada");
    }

    const updatedPolicy = await prisma.policy.update({
        where: {id},
        data: {isActive: false, status: "CANCELLED"}
    })
    return {message: "Poliza dada de baja exitosamente", policy: updatedPolicy}
}

export async function reactivatePolicy(id: string, brokerId: string){
    const policy = await prisma.policy.findFirst({
        where: {id, client: {brokerId}}
    })
    if(!policy){
        throw new Error("Poliza no encontrada");
    }

    const reactivatedPolicy = await prisma.policy.update({
        where: {id},
        data: {isActive: true}
    })
    return reactivatedPolicy
}

export async function getPolicyById(id: string, brokerId: string){
    const policy = await prisma.policy.findFirst({
        where: {id, client: {brokerId}},
        include: {
            broker: { select: { id: true, name: true, role: true } },
            client: { select: { id: true, firstName: true, lastName: true } },
            liabilityDetails: true,
            bondDetails: true,
            lifeDetails: true,
            otherDetails: true,
            rentalDetails: true,
            businessDetails: true,
            homeDetails: true,
            vehicleDetails: true,
            tripDetails: true
        }
    })
    if(!policy){
        throw new Error("Poliza no encontrada")
    }
    return policy
}