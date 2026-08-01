import Joi from "joi";

export const createClaimSchema = Joi.object({
    policyId: Joi.string().uuid().required(),
    incidentDate: Joi.date().iso().required(),
    contactDate: Joi.date().iso().optional(),
    notes: Joi.string().trim().max(1000).optional().allow(null, ''),
})

export const updateClaimSchema = Joi.object({
    contactDate: Joi.date().iso(),
    notes: Joi.string().trim().max(1000).optional().allow(null, ''),
    status: Joi.string().valid("OPEN", "CLOSED").optional(),
}).min(1)
