import Joi from "joi"

export const createQuickMessageSchema = Joi.object({
    name: Joi.string().trim().min(2).max(100).required(),
    message: Joi.string().trim().min(1).max(1000).required(),
})

export const updateQuickMessageSchema = Joi.object({
    name: Joi.string().trim().min(2).max(100),
    message: Joi.string().trim().min(1).max(1000),
}).min(1)
