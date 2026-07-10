import Joi from 'joi';

// Esquema de validación para la creación de un cliente.
export const crearClienteSchema = Joi.object({
    nombres: Joi.string().trim().min(2).max(100).required(),
    apellidos: Joi.string().trim().min(2).max(100).required(),
    documento: Joi.string().trim().min(1).max(30).required(),
    fechaNacimiento: Joi.date().iso().optional(),
    celular: Joi.string().trim().min(6).max(20).optional(),
    celularAlternativo: Joi.string().trim().min(6).max(20).optional(),
    email: Joi.string().trim().min(3).max(200).optional(),
    direccion: Joi.string().trim().min(3).max(200).optional(),
    notas: Joi.string().trim().max(1000).optional().allow('', null)
})

export const actualizarClienteSchema = Joi.object({
    nombres: Joi.string().trim().min(2).max(100),
    apellidos: Joi.string().trim().min(2).max(100),
    documento: Joi.string().trim().min(1).max(30),
    fechaNacimiento: Joi.date().iso(),
    celular: Joi.string().trim().min(6).max(20),
    celularAlternativo: Joi.string().trim().min(6).max(20),
    email: Joi.string().trim().email(),
    direccion: Joi.string().trim().min(3).max(200),
    notas: Joi.string().trim().max(1000).allow('', null)
})