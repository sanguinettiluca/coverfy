import { TipoSeguro } from "../generated/prisma";
import { EstadoPoliza } from "../generated/prisma";
import { MetodoPago } from "../generated/prisma";

export interface CreatePolizaDTO {
    numeroPoliza: String;
    numeroReferencia: String;
    tipoSeguro: TipoSeguro;
    estado: EstadoPoliza;
    fechaInicio: Date;
    fechaVencimiento: Date;
    MontoTotal: Number;
    cuotas: Number;
    metodoPago: MetodoPago;
    clienteId: String;
    coberturaId: String;
    companiaId: String;
    creadoPor: String;
}

export interface UpdatePolizaDTO{
    estado?: EstadoPoliza;
    fechaInicio?: Date;
    fechaVencimiento?: Date;
    MontoTotal?: Number;
    cuotas?: Number;
    metodoPago?: MetodoPago;
}

export interface FilterPolizaDTO {
    busqueda?: string;
    pagina?: number; 
    porPagina?: number;
}