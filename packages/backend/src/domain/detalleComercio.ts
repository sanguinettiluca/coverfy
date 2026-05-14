export interface CreateDetalleComercioDTO {
    razonSocial: string;
    rubro: string;
    direccion: number;
}

export interface UpdateDetalleComercioDTO {
    razonSocial?: string;
    rubro?: string;
    direccion?: number;
}

