export type TipoSeguro =
    | "VEHICLE"
    | "TRIP"
    | "RENTAL"
    | "HOME"
    | "BUSINESS"
    | "LIABILITY"
    | "BOND"
    | "LIFE"
    | "OTHER";

export type EstadoPoliza = "ACTIVE" | "EXPIRED" | "CANCELLED" | "SUSPENDED";
export type MetodoPago = "Cash" | "Credit" | "Transfer" | "Debit";

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
    policyNumber: string;
    referenceNumber?: string | null;
    insuranceType: TipoSeguro;
    status?: EstadoPoliza | null;
    startDate?: string | null;
    expirationDate?: string | null;
    totalAmount?: number | null;
    installments?: number | null;
    paymentMethod?: MetodoPago | null;
    liabilityDetails?: { activity: string; coverageLimit: number } | null;
    bondDetails?: { bondType: string; guaranteedAmount?: number | null; beneficiary: string } | null;
    lifeDetails?: { insuredAmount?: number | null; beneficiary: string } | null;
    otherDetails?: { description: string } | null;
    rentalDetails?: { address: string; propertyType: string; rentAmount: number } | null;
    businessDetails?: { businessName: string; industry: string; address: string } | null;
    homeDetails?: { address: string; constructionType: string; squareMeters?: number | null; propertyValue: number } | null;
    vehicleDetails?: { brand: string; model: string; year: number; licensePlate: string; registrationNumber: string; chassisNumber: string; engineNumber: string } | null;
    tripDetails?: { destination: string; departureDate: string; returnDate: string; passengers: number } | null;
};