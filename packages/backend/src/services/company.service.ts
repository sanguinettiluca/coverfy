import prisma from "../config/prisma";
import { CreateCompanyDTO, UpdateCompanyDTO } from "../domain/company";

export async function createCompany(data: CreateCompanyDTO, brokerId: string) {
    // Verificar si no existe una compañía con el mismo nombre para el mismo broker
    const existingCompany = await prisma.company.findFirst({
        where: { name: data.name, brokerId, isActive: true }
    })

    if (existingCompany) {
        throw new Error("Ya existe una compañía con ese nombre.");
    }

    const company = await prisma.company.create({
        data: {name: data.name, commissionRate: data.commissionRate ?? 0, url: data.url || undefined, brokerId}
    })

    return company;
}

export async function listCompanies(brokerId: string) {
    const companies = await prisma.company.findMany({
        where: { brokerId, isActive: true },
        include: {
            coverages: {
                orderBy: { insuranceType: "asc"}
            }
        },
        orderBy: { name: "asc" }
    })

    return companies;
}

export async function getCompanyById(id: string, brokerId: string){
    const company = await prisma.company.findFirst({
        where: {id, brokerId},
        include: {
            coverages: {
                orderBy: { insuranceType: "asc"}
            }
        }
    })

    if (!company) {
        throw new Error("Compañía no encontrada.");
    }

    return company;
}

export async function updateCompany(id: string, brokerId: string, data: UpdateCompanyDTO) {
    const company = await prisma.company.findFirst({
        where: {id, brokerId}
    })

    if(!company){
        throw new Error("Compañía no encontrada.");
    }

    const updatedCompany = await prisma.company.update({
        where: {id},
        data
    })

    return updatedCompany;
}

export async function deleteCompany(id: string, brokerId: string){
    const company = await prisma.company.findFirst({
        where: {id, brokerId}
    })

    if(!company){
        throw new Error("Compañía no encontrada.");
    }

    const activePoliciesCount = await prisma.policy.count({
        where: {companyId: id, isActive: true}
    })

    if(activePoliciesCount > 0){
        throw new Error("No se puede eliminar la compañía: tiene pólizas activas asociadas.");
    }

    await prisma.$transaction([
        prisma.company.update({
            where: {id},
            data: {isActive: false}
        }),
        prisma.coverage.updateMany({
            where: {companyId: id},
            data: {isActive: false}
        })
    ])

    return { message: "Compañía eliminada exitosamente." };
}

export async function reactivateCompany(id: string, brokerId: string){
    const company = await prisma.company.findFirst({
        where: {id, brokerId}
    })

    if(!company){
        throw new Error("Compañía no encontrada.");
    }

    const reactivatedCompany = await prisma.company.update({
        where: {id},
        data: {isActive: true}
    })

    return reactivatedCompany;
}