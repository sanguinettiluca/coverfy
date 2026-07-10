import Joi from "joi";

export const crearCompaniaSchema = Joi.object({
    nombre: Joi.string().trim().min(2).max(50).required(),
    porcentajeComision: Joi.number().min(0).max(100).optional()
})

export const actualizarCompaniaSchema = Joi.object({
    nombre: Joi.string().trim().min(2).max(50),
    porcentajeComision: Joi.number().min(0).max(100)
}).min(1)