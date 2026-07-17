export type TipoSeguro =
    | "VEHICULO"
    | "VIAJE"
    | "ALQUILER"
    | "HOGAR"
    | "COMERCIO"
    | "RESPONSABILIDAD_CIVIL"
    | "FIANZA"
    | "VIDA"
    | "OTROS";

export type EstadoPoliza = "ACTIVA" | "VENCIDA" | "CANCELADA" | "PENDIENTE";
export type MetodoPago = "Efectivo" | "Credito" | "Transferencia" | "Debito";

export type PolizaEditForm = {
    polizaId?: string;
    numeroReferencia: string;
    tipoSeguro: TipoSeguro | "";
    estado?: EstadoPoliza;
    fechaInicio?: string;
    fechaVencimiento?: string;
    montoTotal?: number;
    cuotas?: number;
    metodoPago?: MetodoPago;

    detalleResponsabilidadCivil?: {
        actividad?: string;
        limiteCobertura?: number;
    };
    detalleFianza?: {
        tipoFianza?: string;
        montoGarantizado?: number;
        beneficiario?: string;
    };
    detalleVida?: {
        sumaAsegurada?: number;
        beneficiario?: string;
    };
    detalleOtros?: {
        descripcion?: string;
    };
    detalleAlquiler?: {
        direccion?: string;
        tipoInmueble?: string;
        valorAlquiler?: number;
        deposito?: number;
    };
    detalleComercio?: {
        razonSocial?: string;
        rubro?: string;
        direccion?: string;
    };
    detalleHogar?: {
        direccion?: string;
        tipoConstruccion?: string;
        metrosCuadrados?: number;
        valorPropiedad?: number;
    };
    detalleVehiculo?: {
        marca?: string;
        modelo?: string;
        anio?: number;
        matricula?: string;
        padron?: string;
        chasis?: string;
        motor?: string;
    };
    detalleViaje?: {
        destino?: string;
        fechaSalida?: string;
        fechaRegreso?: string;
        pasajeros?: number;
    };
};

export type PolizaDetalle = {
    id: string;
    numeroPoliza: string;
    numeroReferencia?: string | null;
    tipoSeguro: TipoSeguro;
    estado?: EstadoPoliza | null;
    fechaInicio?: string | null;
    fechaVencimiento?: string | null;
    montoTotal?: number | null;
    cuotas?: number | null;
    metodoPago?: MetodoPago | null;
    detalleResponsabilidadCivil?: { actividad: string; limiteCobertura: number } | null;
    detalleFianza?: { tipoFianza: string; montoGarantizado?: number | null; beneficiario: string } | null;
    detalleVida?: { sumaAsegurada?: number | null; beneficiario: string } | null;
    detalleOtros?: { descripcion: string } | null;
    detalleAlquiler?: { direccion: string; tipoInmueble: string; valorAlquiler: number; deposito: number } | null;
    detalleComercio?: { razonSocial: string; rubro: string; direccion: string } | null;
    detalleHogar?: { direccion: string; tipoConstruccion: string; metrosCuadrados?: number | null; valorPropiedad: number } | null;
    detalleVehiculo?: { marca: string; modelo: string; anio: number; matricula: string; padron: string; chasis: string; motor: string } | null;
    detalleViaje?: { destino: string; fechaSalida: string; fechaRegreso: string; pasajeros: number } | null;
};