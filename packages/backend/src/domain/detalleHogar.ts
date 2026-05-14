export interface CreateDetalleHogarDTO {
    direccion: string;
    tipoConstruccion: string;
    metrosCuadrados?: number;
    valorPropiedad: number;
}

export interface UpdateDetalleHogarDTO {
    direccion?: string;
    tipoConstruccion?: string;
    metrosCuadrados?: number;
    valorPropiedad?: number;
}
