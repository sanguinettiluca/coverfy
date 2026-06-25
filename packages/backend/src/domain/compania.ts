export interface CreateCompaniaDTO {
    nombre: string;
    porcentajeComision?: number;
}

export interface UpdateCompaniaDTO {
    nombre?: string;
    porcentajeComision?: number;
}