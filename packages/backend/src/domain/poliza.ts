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
    eneficiario: string;
}

export interface DetalleOtrosDTO {
    descripcion: string;
}

// FIN DETALLES.

export type CreatePolizaDTO =
  | (PolizaBaseDTO & { tipoSeguro: "RESPONSABILIDAD_CIVIL"; detalleResponsabilidadCivil: DetalleResponsabilidadCivilDTO })
  | (PolizaBaseDTO & { tipoSeguro: "FIANZA"; detalleFianza: DetalleFianzaDTO })
  | (PolizaBaseDTO & { tipoSeguro: "VIDA"; detalleVida: DetalleVidaDTO })
  | (PolizaBaseDTO & { tipoSeguro: "OTROS"; detalleOtros: DetalleOtrosDTO });

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
}

export interface FilterPolizaDTO {
    busqueda?: string;
    pagina?: number;
    porPagina?: number;
}