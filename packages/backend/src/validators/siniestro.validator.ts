import Joi from "joi";

export const crearSiniestroSchema = Joi.object({
    polizaId: Joi.string().uuid().required(),
    fechaSiniestro: Joi.date().iso().required(),
    fechaContacto: Joi.date().iso().optional(),
    notas: Joi.string().trim().max(1000).optional().allow(null, ''),
})

export const actualizarSiniestroSchema = Joi.object({
    fechaContacto: Joi.date().iso(),
    notas: Joi.string().trim().max(1000).optional().allow(null, ''),
    estado: Joi.string().valid("ABIERTO", "CERRADO").optional(),
}).min(1)