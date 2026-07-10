import {Request, Response, NextFunction} from 'express';
import {ObjectSchema} from 'joi';

// Middleware generico para validar los datos de entrada de las solicitudes HTTP utilizando un esquema de validación de joi.
// Deje en el doc. de tecnologias que es y que hace joi.

export const validate = (schema: ObjectSchema, source: "body" | "query" = "body") => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const {error, value} = schema.validate(req[source], {
            abortEarly: false,
            stripUnknown: true
            // Cualquier campo que el atacante mande y no este declarado en el schema (brokerId,
            // clienteId, tipoSeguro, etc) se descarta antes de llegar a los services.
        })

        if(error){
            res.status(400).json({
                message: "Datos invalidos en la solicitud"
            })
            return;
        }

        req[source] = value;
        next();
    }
}