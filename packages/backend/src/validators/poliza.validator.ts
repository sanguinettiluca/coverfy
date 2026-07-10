import Joi from 'joi';

// Este documento define los esquemas de validación para las pólizas de seguro, incluyendo los detalles específicos según el tipo de seguro.
//  Se utiliza la biblioteca Joi para definir y validar los datos de entrada.
// Evita la duplicación de código al definir un mapa de detalles de seguro y sus respectivos esquemas de validación.

const detalleResponsabilidadCivil = Joi.object({
    actividad: Joi.string().trim().min(3).max(150).required(),
    limiteCobertura: Joi.number().positive().required()
})

const detalleFianza = Joi.object({
    tipoFianza: Joi.string().trim().min(2).max(100).required(),
    montoGarantizado: Joi.number().positive().optional(),
    beneficiario: Joi.string().trim().min(3).max(150).optional()
})

const detalleVida = Joi.object({
    sumaAsegurada: Joi.number().positive().optional(),
    beneficiario: Joi.string().trim().min(2).max(150).optional(),
})

const detalleOtros = Joi.object({
    descripcion: Joi.string().trim().min(3).max(500).required()
})

const detalleAlquiler = Joi.object({
    direccion: Joi.string().trim().min(3).max(200).required(),
    tipoInmueble: Joi.string().trim().min(3).max(100).required(),
    valorAlquiler: Joi.number().positive().required(),
    deposito: Joi.number().positive().required()
})

const detalleComercio = Joi.object({
    razonSocial: Joi.string().trim().min(3).max(150).required(),
    rubro: Joi.string().trim().min(2).max(100).required(),
    direccion: Joi.string().trim().min(3).max(200).required()
})

const detalleHogar = Joi.object({
    direccion: Joi.string().trim().min(3).max(200).required(),
    tipoConstruccion: Joi.string().trim().min(2).max(100).required(),
    metrosCuadrados: Joi.number().positive().optional(),
    valorPropiedad: Joi.number().positive().required()
})

const detalleVehiculo = Joi.object({
    marca: Joi.string().trim().min(2).max(50).required(),
    modelo: Joi.string().trim().min(1).max(50).required(),
    anio: Joi.number().integer().min(1900).max(2100).required(),
    matricula: Joi.string().trim().min(1).max(20).required(),
    padron: Joi.string().trim().min(1).max(20).required(),
    chasis: Joi.string().trim().min(1).max(50).required(),
    motor: Joi.string().trim().min(1).max(50).required()
})

const detalleViaje = Joi.object({
    destino: Joi.string().trim().min(2).max(100).required(),
    fechaSalida: Joi.date().iso().required(),
    fechaRegreso: Joi.date().iso().required(),
    pasajeros: Joi.number().integer().min(1).max(50).required()
})

const detalleMap: Record<string, {clave: string; schema: Joi.ObjectSchema}> = {
    RESPONSABILIDAD_CIVIL: {clave: "detalleResponsabilidadCivil", schema: detalleResponsabilidadCivil},
    FIANZA: {clave: "detalleFianza", schema: detalleFianza},
    VIDA: {clave: "detalleVida", schema: detalleVida},
    OTROS: {clave: "detalleOtros", schema: detalleOtros},
    ALQUILER: {clave: "detalleAlquiler", schema: detalleAlquiler},
    COMERCIO: {clave: "detalleComercio", schema: detalleComercio},
    HOGAR: {clave: "detalleHogar", schema: detalleHogar},
    VEHICULO: {clave: "detalleVehiculo", schema: detalleVehiculo},
    VIAJE: {clave: "detalleViaje", schema: detalleViaje}
}

const polizaBaseFields = {
    numeroPoliza: Joi.string().trim().min(1).max(50).required(),
    numeroReferencia: Joi.string().trim().max(50).optional(),
    estado: Joi.string().valid("ACTIVA", "VENCIDA", "CANCELADA", "SUSPENDIDA").optional(),
    fechaInicio: Joi.date().iso().optional(),
    fechaVencimiento: Joi.date().iso().optional(),
    montoTotal: Joi.number().positive().optional(),
    cuotas: Joi.number().integer().min(1).optional(),
    metodoPago: Joi.string().valid("Debito", "Credito", "Transferencia", "Efectivo").optional(),
    clienteId: Joi.string().uuid().required(),
    companiaId: Joi.string().uuid().required(),
    coberturaId: Joi.string().uuid().optional()
}

export const crearPolizaSchema = Joi.object({
    ...polizaBaseFields,
    tipoSeguro: Joi.string().valid(...Object.keys(detalleMap)).required(),

    detalleResponsabilidadCivil: Joi.when("tipoSeguro", {
        is: "RESPONSABILIDAD_CIVIL", then: detalleResponsabilidadCivil.required(), otherwise: Joi.forbidden(),
    }),
    detalleFianza: Joi.when("tipoSeguro", {
        is: "FIANZA", then: detalleFianza.required(), otherwise: Joi.forbidden(),
    }),
    detalleVida: Joi.when("tipoSeguro", {
        is: "VIDA", then: detalleVida.required(), otherwise: Joi.forbidden(),
    }),
    detalleOtros: Joi.when("tipoSeguro", {
        is: "OTROS", then: detalleOtros.required(), otherwise: Joi.forbidden(),
    }),
    detalleAlquiler: Joi.when("tipoSeguro", {
        is: "ALQUILER", then: detalleAlquiler.required(), otherwise: Joi.forbidden(),
    }),
    detalleComercio: Joi.when("tipoSeguro", {
        is: "COMERCIO", then: detalleComercio.required(), otherwise: Joi.forbidden(),
    }),
    detalleHogar: Joi.when("tipoSeguro", {
        is: "HOGAR", then: detalleHogar.required(), otherwise: Joi.forbidden(),
    }),
    detalleVehiculo: Joi.when("tipoSeguro", {
        is: "VEHICULO", then: detalleVehiculo.required(), otherwise: Joi.forbidden(),
    }),
    detalleViaje: Joi.when("tipoSeguro", {
        is: "VIAJE", then: detalleViaje.required(), otherwise: Joi.forbidden(),
    })
})

export const actualizarPolizaSchema = Joi.object({
    estado: Joi.string().valid("ACTIVA", "VENCIDA", "CANCELADA", "SUSPENDIDA"),
    fechaInicio: Joi.date().iso(),
    fechaVencimiento: Joi.date().iso(),
    montoTotal: Joi.number().positive(),
    cuotas: Joi.number().integer().min(1),
    metodoPago: Joi.string().valid("Debito", "Credito", "Transferencia", "Efectivo"),

    detalleResponsabilidadCivil: detalleResponsabilidadCivil.fork(
        Object.keys(detalleResponsabilidadCivil.describe().keys), (s) => s.optional()
    ),
    detalleFianza: detalleFianza.fork(
        Object.keys(detalleFianza.describe().keys), (s) => s.optional()
    ),
    detalleVida: detalleVida.fork(
        Object.keys(detalleVida.describe().keys), (s) => s.optional()
    ),
    detalleOtros: detalleOtros.fork(
        Object.keys(detalleOtros.describe().keys), (s) => s.optional()
    ),
    detalleAlquiler: detalleAlquiler.fork(
        Object.keys(detalleAlquiler.describe().keys), (s) => s.optional()
    ),
    detalleComercio: detalleComercio.fork(
        Object.keys(detalleComercio.describe().keys), (s) => s.optional()
    ),
    detalleHogar: detalleHogar.fork(
        Object.keys(detalleHogar.describe().keys), (s) => s.optional()
    ),
    detalleVehiculo: detalleVehiculo.fork(
        Object.keys(detalleVehiculo.describe().keys), (s) => s.optional()
    ),
    detalleViaje: detalleViaje.fork(
        Object.keys(detalleViaje.describe().keys), (s) => s.optional()
    )
}).min(1) // Al menos un campo debe ser proporcionado para la actualizacion