import { InsuranceType } from "../generated/prisma";
import { PolicyStatus } from "../generated/prisma";
import { PaymentMethod } from "../generated/prisma";

export interface PolicyBaseDTO{ // NO TOCAR ESTE DTO
    policyNumber: string;
    referenceNumber?: string;
    status?: PolicyStatus;
    startDate?: Date;
    expirationDate?: Date;
    totalAmount?: number;
    installments?: number;
    paymentMethod?: PaymentMethod;
    clientId: string;
    companyId: string;
    coverageId?: string;
}

// DETALLES POLIZAS:

export interface LiabilityDetailsDTO{
    activity: string;
    coverageLimit: number;
}

export interface BondDetailsDTO{
    bondType: string;
    guaranteedAmount?: number;
    beneficiary: string;
}

export interface LifeDetailsDTO {
    insuredAmount?: number;
    beneficiary: string;
}

export interface OtherDetailsDTO {
    description: string;
}

export interface RentalDetailsDTO {
    address: string;
    propertyType: string;
    rentAmount: number;
    deposit: number;
}

export interface BusinessDetailsDTO {
    businessName: string;
    industry: string;
    address: string;
}

export interface HomeDetailsDTO {
    address: string;
    constructionType: string;
    squareMeters?: number;
    propertyValue: number;
}

export interface VehicleDetailsDTO {
    brand: string;
    model: string;
    year: number;
    licensePlate: string;
    registrationNumber: string;
    chassisNumber: string;
    engineNumber: string;
}

export interface TripDetailsDTO {
    destination: string;
    departureDate: Date;
    returnDate: Date;
    passengers: number;
}


// FIN DETALLES.

export type CreatePolicyDTO =
  | (PolicyBaseDTO & { insuranceType: "LIABILITY"; liabilityDetails: LiabilityDetailsDTO })
  | (PolicyBaseDTO & { insuranceType: "BOND"; bondDetails: BondDetailsDTO })
  | (PolicyBaseDTO & { insuranceType: "LIFE"; lifeDetails: LifeDetailsDTO })
  | (PolicyBaseDTO & { insuranceType: "OTHER"; otherDetails: OtherDetailsDTO })
  | (PolicyBaseDTO & { insuranceType: "RENTAL"; rentalDetails: RentalDetailsDTO })
  | (PolicyBaseDTO & { insuranceType: "BUSINESS"; businessDetails: BusinessDetailsDTO })
  | (PolicyBaseDTO & { insuranceType: "HOME"; homeDetails: HomeDetailsDTO })
  | (PolicyBaseDTO & { insuranceType: "VEHICLE"; vehicleDetails: VehicleDetailsDTO })
  | (PolicyBaseDTO & { insuranceType: "TRIP"; tripDetails: TripDetailsDTO });

export interface UpdatePolicyDTO {
    status?: PolicyStatus;
    startDate?: Date;
    expirationDate?: Date;
    totalAmount?: number;
    installments?: number;
    paymentMethod?: PaymentMethod;

    // Detalles opcionales para actualización parcial:
    liabilityDetails?: Partial<LiabilityDetailsDTO>;
    bondDetails?: Partial<BondDetailsDTO>;
    lifeDetails?: Partial<LifeDetailsDTO>;
    otherDetails?: Partial<OtherDetailsDTO>;
    rentalDetails?: Partial<RentalDetailsDTO>;
    businessDetails?: Partial<BusinessDetailsDTO>;
    homeDetails?: Partial<HomeDetailsDTO>;
    vehicleDetails?: Partial<VehicleDetailsDTO>;
    tripDetails?: Partial<TripDetailsDTO>;
}

export interface FilterPolicyDTO {
    search?: string;
    clientId?: string;
    companyId?: string;
    status?: PolicyStatus;
    page?: number;
    perPage?: number;
}
