// Crear cliente:
export interface CreateClienteDTO {
    nombres: string;
    apellidos: string;
    documento: string;
    fechaNacimiento?: Date;
    celular: string;
    celularAlternativo?: string;
    email: string;
    direccion: string;
    notas?: string;
}

// Actualizar cliente:
export interface UpdateClienteDTO{
    nombres?: string;
    apellidos?: string;
    documento?: string;
    fechaNacimiento?: Date;
    celular?: string;
    celularAlternativo?: string;
    email?: string;
    direccion?: string;
    notas?: string;
}

// Filtrar clientes:
export interface FilterClienteDTO {
    busqueda?: string; // Para buscar por nombre, apellido o documento
    pagina?: number; // Número de página para paginación
    porPagina?: number; // Cantidad de clientes por página
}