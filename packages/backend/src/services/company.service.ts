import prisma from "../config/prisma";
import { CreateCompanyDTO, UpdateCompanyDTO } from "../domain/company";

export async function createCompany(data: CreateCompanyDTO, brokerId: string) {
    // Verificar si no existe una compañía con el mismo nombre para el mismo broker
    const existingCompany = await prisma.company.findFirst({
        where: { name: data.name, brokerId }
    })

    if (existingCompany) {
        throw new Error("Ya existe una compañía con ese nombre.");
    }

    const company = await prisma.company.create({
        data: {name: data.name, commissionRate: data.commissionRate ?? 0, brokerId}
    })

    return company;
}

export async function listCompanies(brokerId: string) {
    const companies = await prisma.company.findMany({
        where: { brokerId },
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

    await prisma.company.delete({
        where: {id}
    })

    return { message: "Compañía eliminada exitosamente." };
}
