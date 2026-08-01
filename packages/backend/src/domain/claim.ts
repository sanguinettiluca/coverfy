import {ClaimStatus} from "../generated/prisma";

export interface CreateClaimDTO {
    policyId: string;
    incidentDate: Date;
    contactDate?: Date;
    notes?: string;
}

export interface UpdateClaimDTO {
    contactDate?: Date;
    notes?: string;
    status?: ClaimStatus;
}

export interface FilterClaimDTO{
    status?: ClaimStatus;
    search?: string;
    page?: number;
    perPage?: number;
}
