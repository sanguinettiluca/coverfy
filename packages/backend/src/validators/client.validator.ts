import Joi from 'joi';

// Esquema de validación para la creación de un cliente.
export const createClientSchema = Joi.object({
    firstName: Joi.string().trim().min(2).max(100).required(),
    lastName: Joi.string().trim().min(2).max(100).required(),
    documentNumber: Joi.string().trim().min(1).max(30).required(),
    dateOfBirth: Joi.date().iso().optional(),
    phone: Joi.string().trim().min(6).max(20).optional(),
    alternatePhone: Joi.string().trim().min(6).max(20).optional(),
    email: Joi.string().trim().min(3).max(200).optional(),
    address: Joi.string().trim().min(3).max(200).optional(),
    notes: Joi.string().trim().max(1000).optional().allow('', null)
})

export const updateClientSchema = Joi.object({
    firstName: Joi.string().trim().min(2).max(100),
    lastName: Joi.string().trim().min(2).max(100),
    documentNumber: Joi.string().trim().min(1).max(30),
    dateOfBirth: Joi.date().iso(),
    phone: Joi.string().trim().min(6).max(20),
    alternatePhone: Joi.string().trim().min(6).max(20),
    email: Joi.string().trim().email(),
    address: Joi.string().trim().min(3).max(200),
    notes: Joi.string().trim().max(1000).allow('', null)
})
