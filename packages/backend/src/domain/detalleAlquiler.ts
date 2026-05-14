export interface CreateDetalleAlquilerDTO {
    direccion: string;
    tipoInmueble: string;
    valorAlquiler: number;
    deposito: number;
}

export interface UpdateDetalleAlquilerDTO {
    direccion?: string;
    tipoInmueble?: string;
    valorAlquiler?: number;
    deposito?: number;
}