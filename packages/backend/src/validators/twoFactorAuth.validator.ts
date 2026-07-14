import Joi from "joi";

export const confirmSetupSchema = Joi.object({
    codigo: Joi.string().trim().length(6).pattern(/^\d+$/).required()
})

export const disable2FASchema = Joi.object({
    password: Joi.string().required(),
    codigo: Joi.string().trim().length(6).pattern(/^\d+$/).required()
})