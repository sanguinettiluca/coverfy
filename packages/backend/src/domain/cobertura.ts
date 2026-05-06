import { TipoSeguro } from "../generated/prisma";

export interface CreateCoberturaDTO{
    nombre: string;
    tipoSeguro: TipoSeguro;
    companiaId: string;
}

export interface UpdateCoberturaDTO{
    nombre?: string;
    tipoSeguro?: TipoSeguro;
}