import Joi from "joi"

export const crearMensajeRapidoSchema = Joi.object({
    nombre: Joi.string().trim().min(2).max(100).required(),
    mensaje: Joi.string().trim().min(1).max(1000).required(),
})

export const actualizarMensajeRapidoSchema = Joi.object({
    nombre: Joi.string().trim().min(2).max(100),
    mensaje: Joi.string().trim().min(1).max(1000),
}).min(1)