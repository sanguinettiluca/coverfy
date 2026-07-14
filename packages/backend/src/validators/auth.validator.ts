import Joi from "joi"

export const verifyTwoFactorLoginSchema = Joi.object({
    preAuthToken: Joi.string().required(),
    codigo: Joi.string().trim().min(6).max(9).required()
})