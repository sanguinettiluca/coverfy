import { TipoSeguro } from "../generated/prisma";
import { EstadoPoliza } from "../generated/prisma";
import { MetodoPago } from "../generated/prisma";

export interface PolizaBaseDTO{ // NO TOCAR ESTE DTO
    numeroPoliza: string;
    numeroReferencia?: string;
    estado?: EstadoPoliza;
    fechaInicio?: Date;
    fechaVencimiento?: Date;
    montoTotal?: number;
    cuotas?: number;
    metodoPago?: MetodoPago;
    clienteId: string;
    companiaId: string;
    coberturaId?: string;
}

// DETALLES POLIZAS:

export interface DetalleResponsabilidadCivilDTO{
    actividad: string;
    limiteCobertura: number;
}

export interface DetalleFianzaDTO{
    tipoFianza: string;
    montoGarantizado?: number;
    beneficiario: string;
}

export interface DetalleVidaDTO {
    sumaAsegurada?: number;
    beneficiario: string;
}

export interface DetalleOtrosDTO {
    descripcion: string;
}

export interface DetalleAlquilerDTO {
    direccion: string;
    tipoInmueble: string;
    valorAlquiler: number;
    deposito: number;
}

export interface DetalleComercioDTO {
    razonSocial: string;
    rubro: string;
    direccion: string;
}

export interface DetalleHogarDTO {
    direccion: string;
    tipoConstruccion: string;
    metrosCuadrados?: number;
    valorPropiedad: number;
}

export interface DetalleVehiculoDTO {
    marca: string;
    modelo: string;
    anio: number;
    matricula: string;
    padron: string;
    chasis: string;
    motor: string;
}

export interface DetalleViajeDTO {
    destino: string;
    fechaSalida: Date;
    fechaRegreso: Date;
    pasajeros: number;
}


// FIN DETALLES.

export type CreatePolizaDTO =
  | (PolizaBaseDTO & { tipoSeguro: "RESPONSABILIDAD_CIVIL"; detalleResponsabilidadCivil: DetalleResponsabilidadCivilDTO })
  | (PolizaBaseDTO & { tipoSeguro: "FIANZA"; detalleFianza: DetalleFianzaDTO })
  | (PolizaBaseDTO & { tipoSeguro: "VIDA"; detalleVida: DetalleVidaDTO })
  | (PolizaBaseDTO & { tipoSeguro: "OTROS"; detalleOtros: DetalleOtrosDTO })
  | (PolizaBaseDTO & { tipoSeguro: "ALQUILER"; detalleAlquiler: DetalleAlquilerDTO })
  | (PolizaBaseDTO & { tipoSeguro: "COMERCIO"; detalleComercio: DetalleComercioDTO })
  | (PolizaBaseDTO & { tipoSeguro: "HOGAR"; detalleHogar: DetalleHogarDTO })
  | (PolizaBaseDTO & { tipoSeguro: "VEHICULO"; detalleVehiculo: DetalleVehiculoDTO })
  | (PolizaBaseDTO & { tipoSeguro: "VIAJE"; detalleViaje: DetalleViajeDTO });

export interface UpdatePolizaDTO {
    estado?: EstadoPoliza;
    fechaInicio?: Date;
    fechaVencimiento?: Date;
    montoTotal?: number;
    cuotas?: number;
    metodoPago?: MetodoPago;

    // Detalles opcionales para actualización parcial:
    detalleResponsabilidadCivil?: Partial<DetalleResponsabilidadCivilDTO>;
    detalleFianza?: Partial<DetalleFianzaDTO>;
    detalleVida?: Partial<DetalleVidaDTO>;
    detalleOtros?: Partial<DetalleOtrosDTO>;
    detalleAlquiler?: Partial<DetalleAlquilerDTO>;
    detalleComercio?: Partial<DetalleComercioDTO>;
    detalleHogar?: Partial<DetalleHogarDTO>;
    detalleVehiculo?: Partial<DetalleVehiculoDTO>;
    detalleViaje?: Partial<DetalleViajeDTO>;
}

export interface FilterPolizaDTO {
    busqueda?: string;
    clienteId?: string;
    pagina?: number;
    porPagina?: number;
}