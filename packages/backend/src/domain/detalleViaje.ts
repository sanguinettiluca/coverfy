export interface CreateDetalleViajeDTO {
    destino: string;
    fechaSalida: Date;
    fechaRegreso: Date;
    pasajeros: number;
}

export interface UpdateDetalleViajeDTO {
    destino?: string;
    fechaSalida?: Date;
    fechaRegreso?: Date;
    pasajeros?: number;
}