import prisma from "../config/prisma";
import { CreateCoverageDTO, UpdateCoverageDTO } from "../domain/coverage";
import { InsuranceType } from "../generated/prisma";

export async function createCoverage(data: CreateCoverageDTO, brokerId: string){
    const company = await prisma.company.findFirst({
        where: {id: data.companyId, brokerId}
    })

    if(!company){
        throw new Error('Compania no encontrada')
    }

    const existingCoverage = await prisma.coverage.findFirst({
        where: {
            name: data.name,
            insuranceType: data.insuranceType,
            companyId: data.companyId,
            isActive: true
        }
    })

    if(existingCoverage){
        throw new Error('Ya existe una cobertura con ese nombre para este tipo de seguro')
    }

    const coverage = await prisma.coverage.create({
        data:{
            name: data.name,
            insuranceType: data.insuranceType,
            companyId: data.companyId
        }
    })

    return coverage
}

export async function listCoverages(companyId: string, brokerId: string, insuranceType?: InsuranceType) {
    const company = await prisma.company.findFirst({
        where: {id: companyId, brokerId}
    })

    if(!company){
        throw new Error('Compañia no encontrada')
    }

    // Solo listar coberturas activas
    const coverages = await prisma.coverage.findMany({
        where:{
            companyId,
            isActive: true,
            // Si se proporciona un tipo de seguro, filtramos por él
            ...(insuranceType && { insuranceType })
        },
        orderBy: {name: 'asc'}
    })

    console.log('Coverages:', coverages) // Agrega este log para verificar los resultados

    return coverages
}

export async function updateCoverage(id: string, brokerId: string, data: UpdateCoverageDTO){
    const coverage = await prisma.coverage.findFirst({
        where:{
            id,
            company: {brokerId}
        }
    })

    if(!coverage){
        throw new Error('Cobertura no encontrada')
    }

    const updatedCoverage = await prisma.coverage.update({
        where: {id},
        data
    })

    return updatedCoverage
}

export async function deleteCoverage(id: string, brokerId: string) {
    const coverage = await prisma.coverage.findFirst({
        where: {
            id,
            company: { brokerId }
        }
    })

    if (!coverage) {
        throw new Error('Cobertura no encontrada')
    }

    const activePolicy = await prisma.policy.findFirst({
        where: {
            coverageId: id,
            status: 'ACTIVE',
            isActive: true
        }
    })

    if (activePolicy) {
        throw new Error('No se puede eliminar la cobertura porque tiene pólizas activas asociadas')
    }

    const updatedCoverage = await prisma.coverage.update({
        where: { id },
        data: { isActive: false }
    })
    return updatedCoverage
}

export async function reactivateCoverage(id: string, brokerId: string) {
    const coverage = await prisma.coverage.findFirst({
        where: {
            id,
            company: { brokerId }
        }
    })

    if (!coverage) {
        throw new Error('Cobertura no encontrada')
    }

    const updatedCoverage = await prisma.coverage.update({
        where: { id },
        data: { isActive: true }
    })
    return updatedCoverage
}
