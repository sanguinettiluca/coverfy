export interface CreateDetalleFianzaDTO {
    tipoFianza: string;
    montoGarantizado: number;
    beneficiario: string;
}

export interface UpdateDetalleFianzaDTO {
    tipoFianza?: string;
    montoGarantizado?: number;
    beneficiario?: string;
}