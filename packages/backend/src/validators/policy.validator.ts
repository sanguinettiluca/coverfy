import Joi from 'joi';

// Este documento define los esquemas de validación para las pólizas de seguro, incluyendo los detalles específicos según el tipo de seguro.
//  Se utiliza la biblioteca Joi para definir y validar los datos de entrada.
// Evita la duplicación de código al definir un mapa de detalles de seguro y sus respectivos esquemas de validación.

const liabilityDetails = Joi.object({
    activity: Joi.string().trim().min(3).max(150).required(),
    coverageLimit: Joi.number().positive().required()
})

const bondDetails = Joi.object({
    bondType: Joi.string().trim().min(2).max(100).required(),
    guaranteedAmount: Joi.number().positive().optional(),
    beneficiary: Joi.string().trim().min(3).max(150).optional()
})

const lifeDetails = Joi.object({
    insuredAmount: Joi.number().positive().optional(),
    beneficiary: Joi.string().trim().min(2).max(150).optional(),
})

const otherDetails = Joi.object({
    description: Joi.string().trim().min(3).max(500).required()
})

const rentalDetails = Joi.object({
    address: Joi.string().trim().min(3).max(200).required(),
    propertyType: Joi.string().trim().min(3).max(100).required(),
    rentAmount: Joi.number().positive().required(),
    deposit: Joi.number().positive().required()
})

const businessDetails = Joi.object({
    businessName: Joi.string().trim().min(3).max(150).required(),
    industry: Joi.string().trim().min(2).max(100).required(),
    address: Joi.string().trim().min(3).max(200).required()
})

const homeDetails = Joi.object({
    address: Joi.string().trim().min(3).max(200).required(),
    constructionType: Joi.string().trim().min(2).max(100).required(),
    squareMeters: Joi.number().positive().optional(),
    propertyValue: Joi.number().positive().required()
})

const vehicleDetails = Joi.object({
    brand: Joi.string().trim().min(2).max(50).required(),
    model: Joi.string().trim().min(1).max(50).required(),
    year: Joi.number().integer().min(1900).max(2100).required(),
    licensePlate: Joi.string().trim().min(1).max(20).required(),
    registrationNumber: Joi.string().trim().min(1).max(20).required(),
    chassisNumber: Joi.string().trim().min(1).max(50).required(),
    engineNumber: Joi.string().trim().min(1).max(50).required()
})

const tripDetails = Joi.object({
    destination: Joi.string().trim().min(2).max(100).required(),
    departureDate: Joi.date().iso().required(),
    returnDate: Joi.date().iso().required(),
    passengers: Joi.number().integer().min(1).max(50).required()
})

const detailsMap: Record<string, {key: string; schema: Joi.ObjectSchema}> = {
    LIABILITY: {key: "liabilityDetails", schema: liabilityDetails},
    BOND: {key: "bondDetails", schema: bondDetails},
    LIFE: {key: "lifeDetails", schema: lifeDetails},
    OTHER: {key: "otherDetails", schema: otherDetails},
    RENTAL: {key: "rentalDetails", schema: rentalDetails},
    BUSINESS: {key: "businessDetails", schema: businessDetails},
    HOME: {key: "homeDetails", schema: homeDetails},
    VEHICLE: {key: "vehicleDetails", schema: vehicleDetails},
    TRIP: {key: "tripDetails", schema: tripDetails}
}

const policyBaseFields = {
    policyNumber: Joi.string().trim().min(1).max(50).required(),
    referenceNumber: Joi.string().trim().max(50).optional(),
    status: Joi.string().valid("ACTIVE", "EXPIRED", "CANCELLED", "SUSPENDED").optional(),
    startDate: Joi.date().iso().optional(),
    expirationDate: Joi.date().iso().optional(),
    totalAmount: Joi.number().positive().optional(),
    installments: Joi.number().integer().min(1).optional(),
    paymentMethod: Joi.string().valid("Debit", "Credit", "Transfer", "Cash").optional(),
    clientId: Joi.string().uuid().required(),
    companyId: Joi.string().uuid().required(),
    coverageId: Joi.string().uuid().optional()
}

export const createPolicySchema = Joi.object({
    ...policyBaseFields,
    insuranceType: Joi.string().valid(...Object.keys(detailsMap)).required(),

    liabilityDetails: Joi.when("insuranceType", {
        is: "LIABILITY", then: liabilityDetails.required(), otherwise: Joi.forbidden(),
    }),
    bondDetails: Joi.when("insuranceType", {
        is: "BOND", then: bondDetails.required(), otherwise: Joi.forbidden(),
    }),
    lifeDetails: Joi.when("insuranceType", {
        is: "LIFE", then: lifeDetails.required(), otherwise: Joi.forbidden(),
    }),
    otherDetails: Joi.when("insuranceType", {
        is: "OTHER", then: otherDetails.required(), otherwise: Joi.forbidden(),
    }),
    rentalDetails: Joi.when("insuranceType", {
        is: "RENTAL", then: rentalDetails.required(), otherwise: Joi.forbidden(),
    }),
    businessDetails: Joi.when("insuranceType", {
        is: "BUSINESS", then: businessDetails.required(), otherwise: Joi.forbidden(),
    }),
    homeDetails: Joi.when("insuranceType", {
        is: "HOME", then: homeDetails.required(), otherwise: Joi.forbidden(),
    }),
    vehicleDetails: Joi.when("insuranceType", {
        is: "VEHICLE", then: vehicleDetails.required(), otherwise: Joi.forbidden(),
    }),
    tripDetails: Joi.when("insuranceType", {
        is: "TRIP", then: tripDetails.required(), otherwise: Joi.forbidden(),
    })
})

export const updatePolicySchema = Joi.object({
    status: Joi.string().valid("ACTIVE", "EXPIRED", "CANCELLED", "SUSPENDED"),
    startDate: Joi.date().iso(),
    expirationDate: Joi.date().iso(),
    totalAmount: Joi.number().positive(),
    installments: Joi.number().integer().min(1),
    paymentMethod: Joi.string().valid("Debit", "Credit", "Transfer", "Cash"),

    liabilityDetails: liabilityDetails.fork(
        Object.keys(liabilityDetails.describe().keys), (s) => s.optional()
    ),
    bondDetails: bondDetails.fork(
        Object.keys(bondDetails.describe().keys), (s) => s.optional()
    ),
    lifeDetails: lifeDetails.fork(
        Object.keys(lifeDetails.describe().keys), (s) => s.optional()
    ),
    otherDetails: otherDetails.fork(
        Object.keys(otherDetails.describe().keys), (s) => s.optional()
    ),
    rentalDetails: rentalDetails.fork(
        Object.keys(rentalDetails.describe().keys), (s) => s.optional()
    ),
    businessDetails: businessDetails.fork(
        Object.keys(businessDetails.describe().keys), (s) => s.optional()
    ),
    homeDetails: homeDetails.fork(
        Object.keys(homeDetails.describe().keys), (s) => s.optional()
    ),
    vehicleDetails: vehicleDetails.fork(
        Object.keys(vehicleDetails.describe().keys), (s) => s.optional()
    ),
    tripDetails: tripDetails.fork(
        Object.keys(tripDetails.describe().keys), (s) => s.optional()
    )
}).min(1) // Al menos un campo debe ser proporcionado para la actualizacion
