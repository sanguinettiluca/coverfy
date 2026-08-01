import { InsuranceType } from "../generated/prisma";

export interface CreateCoverageDTO{
    name: string;
    insuranceType: InsuranceType;
    companyId: string;
}

export interface UpdateCoverageDTO{
    name?: string;
    insuranceType?: InsuranceType;
}
