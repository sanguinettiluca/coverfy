// Crear cliente:
export interface CreateClientDTO {
    firstName: string;
    lastName: string;
    documentNumber: string;
    dateOfBirth?: Date;
    phone: string;
    alternatePhone?: string;
    email: string;
    address: string;
    notes?: string;
}

// Actualizar cliente:
export interface UpdateClientDTO{
    firstName?: string;
    lastName?: string;
    documentNumber?: string;
    dateOfBirth?: Date;
    phone?: string;
    alternatePhone?: string;
    email?: string;
    address?: string;
    notes?: string;
}

// Filtrar clientes:
export interface FilterClientDTO {
    search?: string; // Para buscar por nombre, apellido o documento
    page?: number; // Número de página para paginación
    perPage?: number; // Cantidad de clientes por página
}
