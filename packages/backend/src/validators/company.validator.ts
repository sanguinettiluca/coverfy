import Joi from "joi";

export const createCompanySchema = Joi.object({
    name: Joi.string().trim().min(2).max(50).required(),
    commissionRate: Joi.number().min(0).max(100).optional(),
    url: Joi.string().trim().uri({ scheme: ['http', 'https'] }).optional().allow(null, '')
})

export const updateCompanySchema = Joi.object({
    name: Joi.string().trim().min(2).max(50),
    commissionRate: Joi.number().min(0).max(100),
    url: Joi.string().trim().uri({ scheme: ['http', 'https'] }).allow(null, '')
}).min(1)