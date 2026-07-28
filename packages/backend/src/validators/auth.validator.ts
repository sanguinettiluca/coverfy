import Joi from "joi"

export const verifyTwoFactorLoginSchema = Joi.object({
    preAuthToken: Joi.string().required(),
    code: Joi.string().trim().min(6).max(9).required()
})
