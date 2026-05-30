import {EstadoSiniestro} from "../generated/prisma";

export interface CreateSiniestroDTO {
    polizaId: string;
    fechaSiniestro: Date;
    fechaContacto?: Date;
    notas?: string;
}

export interface UpdateSiniestroDTO {
    fechaContacto?: Date;
    notas?: string;
    estado?: EstadoSiniestro;
}

export interface FilterSiniestroDTO{
    estado?: EstadoSiniestro;
    busqueda?: string;
    pagina?: number;
    porPagina?: number;
}