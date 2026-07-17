import { FileText } from "lucide-react";
import DeletePolicyButton from "./DeletePolicyButton";

type TipoSeguro =
    | "VEHICULO"
    | "VIAJE"
    | "ALQUILER"
    | "HOGAR"
    | "COMERCIO"
    | "RESPONSABILIDAD_CIVIL"
    | "FIANZA"
    | "VIDA"
    | "OTROS";

type EstadoPoliza = "ACTIVA" | "VENCIDA" | "CANCELADA" | "PENDIENTE" | "SUSPENDIDA";
type MetodoPago = "Efectivo" | "Credito" | "Transferencia" | "Debito";

type Cobertura = {
    id: string;
    nombre: string;
    companiaId: string;
    tipoSeguro: TipoSeguro;
};

type Compania = {
    id: string;
    nombre: string;
    porcentajeComision: number;
    brokerId: string;
    createdAt: string;
    coberturas: Cobertura[];
};

type PolizaDetalle = {
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
    companiaId: string;
    coberturaId?: string | null;
    broker?: { id: string; nombre: string; role: string } | null;
    cliente?: { id: string; nombres: string; apellidos: string } | null;
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

type PolicyResultProps = {
    poliza: PolizaDetalle;
    compania: Compania | null;
    onEliminada: () => void;
};

const formatMonto = (monto?: number | null) =>
    monto != null ? `$${monto.toFixed(2)}` : "-";

const formatFecha = (fecha?: string | null) =>
    fecha ? new Date(fecha).toLocaleDateString("es-UY") : "-";

const formatTexto = (valor?: string | null) =>
    valor && valor.trim() !== "" ? valor : "-";

const getEstadoClass = (estado?: string | null) => {
    switch (estado?.trim().toUpperCase()) {
        case "ACTIVA":
            return "policy-result-badge--activa";
        case "VENCIDA":
        case "CANCELADA":
            return "policy-result-badge--vencida";
        case "SUSPENDIDA":
            return "policy-result-badge--suspendida";
        case "PENDIENTE":
            return "policy-result-badge--pendiente";
        default:
            return "";
    }
};

const PolicyResult = ({ poliza, compania, onEliminada }: PolicyResultProps) => {
    const cobertura = compania?.coberturas.find((c) => c.id === poliza.coberturaId);

    return (
        <div>

            <div className="policy-result-header">
                <div className="policy-result-title-group">
                    <div className="policy-result-icon">
                        <FileText size={20} />
                    </div>
                    <div>
                        <div className="policy-result-numero">{poliza.numeroPoliza}</div>
                        <div className="policy-result-tipo">{poliza.tipoSeguro}</div>
                    </div>
                </div>

                {poliza.estado && (
                    <div className="policy-result-badges">
                        <span className={`policy-result-badge ${getEstadoClass(poliza.estado)}`}>
                            {poliza.estado}
                        </span>
                    </div>
                )}
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
                <DeletePolicyButton
                    polizaId={poliza.id}
                    numeroPoliza={poliza.numeroPoliza}
                    onEliminada={onEliminada}
                />
            </div>

            <div className="client-result-grid">

                <div className="client-result-field">
                    <span className="client-result-label">Número de Referencia</span>
                    <span className={`client-result-value ${!poliza.numeroReferencia ? "client-result-value--muted" : ""}`}>
                        {formatTexto(poliza.numeroReferencia)}
                    </span>
                </div>

                <div className="client-result-field">
                    <span className="client-result-label">Método de Pago</span>
                    <span className="client-result-value">{poliza.metodoPago ?? "-"}</span>
                </div>

                <div className="client-result-field">
                    <span className="client-result-label">Fecha de Inicio</span>
                    <span className="client-result-value">{formatFecha(poliza.fechaInicio)}</span>
                </div>

                <div className="client-result-field">
                    <span className="client-result-label">Fecha de Vencimiento</span>
                    <span className="client-result-value">{formatFecha(poliza.fechaVencimiento)}</span>
                </div>

                <div className="client-result-field">
                    <span className="client-result-label">Monto Total</span>
                    <span className="client-result-value">{formatMonto(poliza.montoTotal)}</span>
                </div>

                <div className="client-result-field">
                    <span className="client-result-label">Cuotas</span>
                    <span className="client-result-value">{poliza.cuotas ?? "-"}</span>
                </div>

                <div className="client-result-field">
                    <span className="client-result-label">Cliente</span>
                    <span className="client-result-value">
                        {poliza.cliente ? `${poliza.cliente.nombres} ${poliza.cliente.apellidos}` : "-"}
                    </span>
                </div>

                <div className="client-result-field">
                    <span className="client-result-label">Broker</span>
                    <span className="client-result-value">{poliza.broker?.nombre ?? "-"}</span>
                </div>

                <div className="client-result-field">
                    <span className="client-result-label">Compañía</span>
                    <span className="client-result-value">{compania?.nombre ?? "-"}</span>
                </div>

                <div className="client-result-field">
                    <span className="client-result-label">Comisión</span>
                    <span className="client-result-value">
                        {compania?.porcentajeComision != null ? `${compania.porcentajeComision}%` : "-"}
                    </span>
                </div>

                <div className="client-result-field">
                    <span className="client-result-label">Cobertura</span>
                    <span className="client-result-value">{cobertura?.nombre ?? "-"}</span>
                </div>

            </div>

            {poliza.detalleResponsabilidadCivil && (
                <>
                    <div className="policy-result-section-title">Responsabilidad Civil</div>
                    <div className="client-result-grid">
                        <div className="client-result-field">
                            <span className="client-result-label">Actividad</span>
                            <span className="client-result-value">{poliza.detalleResponsabilidadCivil.actividad}</span>
                        </div>
                        <div className="client-result-field">
                            <span className="client-result-label">Límite de Cobertura</span>
                            <span className="client-result-value">{formatMonto(poliza.detalleResponsabilidadCivil.limiteCobertura)}</span>
                        </div>
                    </div>
                </>
            )}

            {poliza.detalleFianza && (
                <>
                    <div className="policy-result-section-title">Fianza</div>
                    <div className="client-result-grid">
                        <div className="client-result-field">
                            <span className="client-result-label">Tipo de Fianza</span>
                            <span className="client-result-value">{poliza.detalleFianza.tipoFianza}</span>
                        </div>
                        <div className="client-result-field">
                            <span className="client-result-label">Monto Garantizado</span>
                            <span className="client-result-value">{formatMonto(poliza.detalleFianza.montoGarantizado)}</span>
                        </div>
                        <div className="client-result-field client-result-field--full">
                            <span className="client-result-label">Beneficiario</span>
                            <span className="client-result-value">{poliza.detalleFianza.beneficiario}</span>
                        </div>
                    </div>
                </>
            )}

            {poliza.detalleVida && (
                <>
                    <div className="policy-result-section-title">Vida</div>
                    <div className="client-result-grid">
                        <div className="client-result-field">
                            <span className="client-result-label">Suma Asegurada</span>
                            <span className="client-result-value">{formatMonto(poliza.detalleVida.sumaAsegurada)}</span>
                        </div>
                        <div className="client-result-field">
                            <span className="client-result-label">Beneficiario</span>
                            <span className="client-result-value">{poliza.detalleVida.beneficiario}</span>
                        </div>
                    </div>
                </>
            )}

            {poliza.detalleOtros && (
                <>
                    <div className="policy-result-section-title">Otros</div>
                    <div className="client-result-grid">
                        <div className="client-result-field client-result-field--full">
                            <span className="client-result-label">Descripción</span>
                            <span className="client-result-value">{poliza.detalleOtros.descripcion}</span>
                        </div>
                    </div>
                </>
            )}

            {poliza.detalleAlquiler && (
                <>
                    <div className="policy-result-section-title">Alquiler</div>
                    <div className="client-result-grid">
                        <div className="client-result-field client-result-field--full">
                            <span className="client-result-label">Dirección</span>
                            <span className="client-result-value">{poliza.detalleAlquiler.direccion}</span>
                        </div>
                        <div className="client-result-field">
                            <span className="client-result-label">Tipo de Inmueble</span>
                            <span className="client-result-value">{poliza.detalleAlquiler.tipoInmueble}</span>
                        </div>
                        <div className="client-result-field">
                            <span className="client-result-label">Valor de Alquiler</span>
                            <span className="client-result-value">{formatMonto(poliza.detalleAlquiler.valorAlquiler)}</span>
                        </div>
                        <div className="client-result-field">
                            <span className="client-result-label">Depósito</span>
                            <span className="client-result-value">{formatMonto(poliza.detalleAlquiler.deposito)}</span>
                        </div>
                    </div>
                </>
            )}

            {poliza.detalleComercio && (
                <>
                    <div className="policy-result-section-title">Comercio</div>
                    <div className="client-result-grid">
                        <div className="client-result-field">
                            <span className="client-result-label">Razón Social</span>
                            <span className="client-result-value">{poliza.detalleComercio.razonSocial}</span>
                        </div>
                        <div className="client-result-field">
                            <span className="client-result-label">Rubro</span>
                            <span className="client-result-value">{poliza.detalleComercio.rubro}</span>
                        </div>
                        <div className="client-result-field client-result-field--full">
                            <span className="client-result-label">Dirección</span>
                            <span className="client-result-value">{poliza.detalleComercio.direccion}</span>
                        </div>
                    </div>
                </>
            )}

            {poliza.detalleHogar && (
                <>
                    <div className="policy-result-section-title">Hogar</div>
                    <div className="client-result-grid">
                        <div className="client-result-field client-result-field--full">
                            <span className="client-result-label">Dirección</span>
                            <span className="client-result-value">{poliza.detalleHogar.direccion}</span>
                        </div>
                        <div className="client-result-field">
                            <span className="client-result-label">Tipo de Construcción</span>
                            <span className="client-result-value">{poliza.detalleHogar.tipoConstruccion}</span>
                        </div>
                        <div className="client-result-field">
                            <span className="client-result-label">Metros Cuadrados</span>
                            <span className="client-result-value">{poliza.detalleHogar.metrosCuadrados ?? "-"}</span>
                        </div>
                        <div className="client-result-field">
                            <span className="client-result-label">Valor de la Propiedad</span>
                            <span className="client-result-value">{formatMonto(poliza.detalleHogar.valorPropiedad)}</span>
                        </div>
                    </div>
                </>
            )}

            {poliza.detalleVehiculo && (
                <>
                    <div className="policy-result-section-title">Vehículo</div>
                    <div className="client-result-grid">
                        <div className="client-result-field">
                            <span className="client-result-label">Marca</span>
                            <span className="client-result-value">{poliza.detalleVehiculo.marca}</span>
                        </div>
                        <div className="client-result-field">
                            <span className="client-result-label">Modelo</span>
                            <span className="client-result-value">{poliza.detalleVehiculo.modelo}</span>
                        </div>
                        <div className="client-result-field">
                            <span className="client-result-label">Año</span>
                            <span className="client-result-value">{poliza.detalleVehiculo.anio}</span>
                        </div>
                        <div className="client-result-field">
                            <span className="client-result-label">Matrícula</span>
                            <span className="client-result-value">{poliza.detalleVehiculo.matricula}</span>
                        </div>
                        <div className="client-result-field">
                            <span className="client-result-label">Padrón</span>
                            <span className="client-result-value">{poliza.detalleVehiculo.padron}</span>
                        </div>
                        <div className="client-result-field">
                            <span className="client-result-label">Chasis</span>
                            <span className="client-result-value">{poliza.detalleVehiculo.chasis}</span>
                        </div>
                        <div className="client-result-field">
                            <span className="client-result-label">Motor</span>
                            <span className="client-result-value">{poliza.detalleVehiculo.motor}</span>
                        </div>
                    </div>
                </>
            )}

            {poliza.detalleViaje && (
                <>
                    <div className="policy-result-section-title">Viaje</div>
                    <div className="client-result-grid">
                        <div className="client-result-field">
                            <span className="client-result-label">Destino</span>
                            <span className="client-result-value">{poliza.detalleViaje.destino}</span>
                        </div>
                        <div className="client-result-field">
                            <span className="client-result-label">Fecha de Salida</span>
                            <span className="client-result-value">{formatFecha(poliza.detalleViaje.fechaSalida)}</span>
                        </div>
                        <div className="client-result-field">
                            <span className="client-result-label">Fecha de Regreso</span>
                            <span className="client-result-value">{formatFecha(poliza.detalleViaje.fechaRegreso)}</span>
                        </div>
                        <div className="client-result-field">
                            <span className="client-result-label">Pasajeros</span>
                            <span className="client-result-value">{poliza.detalleViaje.pasajeros}</span>
                        </div>
                    </div>
                </>
            )}

        </div>
    );
};

export default PolicyResult;