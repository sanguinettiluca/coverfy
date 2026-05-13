import { TipoSeguro } from "../generated/prisma";
import { EstadoPoliza } from "../generated/prisma";
import { MetodoPago } from "../generated/prisma";

export interface CreatePolizaDTO {
    numeroPoliza: string;
    numeroReferencia: string;
    tipoSeguro: TipoSeguro;
    estado: EstadoPoliza;
    fechaInicio: Date;
    fechaVencimiento: Date;
    montoTotal: number;
    cuotas: number;
    metodoPago: MetodoPago;
    clienteId: string;
    coberturaId: string;
    companiaId: string;
}

export interface UpdatePolizaDTO{
    estado?: EstadoPoliza;
    fechaInicio?: Date;
    fechaVencimiento?: Date;
    MontoTotal?: number;
    cuotas?: number;
    metodoPago?: MetodoPago;
}

export interface FilterPolizaDTO {
    busqueda?: string;
    pagina?: number; 
    porPagina?: number;
}