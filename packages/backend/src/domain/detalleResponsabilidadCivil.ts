export interface CreateDetalleResponsabilidadCivilDTO {
    actividad: string;
    limiteCobertura: number;
}

export interface UpdateDetalleResponsabilidadCivilDTO {
    actividad?: string;
    limiteCobertura?: number;
}