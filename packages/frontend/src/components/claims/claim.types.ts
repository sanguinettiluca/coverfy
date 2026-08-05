export type ClaimStatus = "OPEN" | "CLOSED";

export type ClaimPolicySummary = {
    id: string;
    policyNumber: string;
    referenceNumber?: string | null;
    insuranceType: string;
    client?: { id: string; firstName: string; lastName: string } | null;
    vehicleDetails?: { brand: string; model: string; licensePlate: string } | null;
};
export type Claim = {
    id: string;
    incidentDate: string;
    contactDate?: string | null;
    notes?: string | null;
    status: ClaimStatus;
    policyId: string;
    brokerId: string;
    createdAt: string;
    updatedAt: string;
    policy: ClaimPolicySummary;
};

export type CreateClaimForm = {
    policyId: string;
    incidentDate: string;
    contactDate?: string;
    notes?: string;
};

export type UpdateClaimForm = {
    claimId?: string;
    status?: ClaimStatus;
    contactDate?: string;
    notes?: string;
};