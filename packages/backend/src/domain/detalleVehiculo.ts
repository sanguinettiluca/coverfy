export interface CreateDetalleVehiculoDTO {
    marca: string;
    modelo: string;
    anio: number;
    matricula: string;
    padron: string;
    chasis: string;
    motor: string;
}

export interface UpdateDetalleVehiculoDTO {
    marca?: string;
    modelo?: string;
    anio?: number;
    matricula?: string;
    padron?: string;
    chasis?: string;
    motor?: string;
}

