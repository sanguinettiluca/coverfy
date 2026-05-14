export interface CreateDetalleVidaDTO {
    sumaAsegurada: number;
    beneficiario: string;
}

export interface UpdateDetalleVidaDTO {
    sumaAsegurada?: number;
    beneficiario?: string;
}