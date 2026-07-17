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

export type EstadoPoliza = "ACTIVA" | "VENCIDA" | "CANCELADA" | "SUSPENDIDA";
export type MetodoPago = "Efectico" | "Credito" | "Transferencia" | "Debito";

export type PolizaForm = {
    tipoSeguro: TipoSeguro | "";
    numeroPoliza: string;
    numeroReferencia?: string;
    estado?: EstadoPoliza;
    fechaInicio?: string;
    fechaVencimiento?: string;
    montoTotal?: number;
    cuotas?: number;
    metodoPago?: MetodoPago;
    clienteId: string;
    companiaId: string;
    coberturaId?: string;

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