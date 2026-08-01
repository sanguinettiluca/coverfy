import { FileText } from "lucide-react";
import DeletePolicyButton from "./DeletePolicyButton";
import PolicyPDFButton from "./PolicyPdf";


type InsuranceType =
    | "VEHICLE"
    | "TRIP"
    | "RENTAL"
    | "HOME"
    | "BUSINESS"
    | "LIABILITY"
    | "BOND"
    | "LIFE"
    | "OTHER";

type PolicyStatus = "ACTIVE" | "EXPIRED" | "CANCELLED" | "SUSPENDED";
type PaymentMethod = "Cash" | "Credit" | "Transfer" | "Debit";

type Coverage = {
    id: string;
    name: string;
    companyId: string;
    insuranceType: InsuranceType;
};

type Company = {
    id: string;
    name: string;
    commissionRate: number;
    brokerId: string;
    createdAt: string;
    coverages: Coverage[];
};

type Policy = {
    id: string;
    policyNumber: string;
    referenceNumber?: string | null;
    insuranceType: InsuranceType;
    status?: PolicyStatus | null;
    startDate?: string | null;
    expirationDate?: string | null;
    totalAmount?: number | null;
    installments?: number | null;
    paymentMethod?: PaymentMethod | null;
    companyId: string;
    coverageId?: string | null;
    broker?: { id: string; name: string; role: string } | null;
    client?: { id: string; firstName: string; lastName: string } | null;
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

type PolicyResultProps = {
    poliza: Policy;
    compania: Company | null;
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
        case "ACTIVE":
            return "policy-result-badge--activa";
        case "EXPIRED":
        case "CANCELLED":
            return "policy-result-badge--vencida";
        case "SUSPENDED":
            return "policy-result-badge--suspendida";
        default:
            return "";
    }
};

const PolicyResult = ({ poliza, compania, onEliminada }: PolicyResultProps) => {
    const cobertura = compania?.coverages.find((c) => c.id === poliza.coverageId);

    return (
        <div>

            <div className="policy-result-header">
                <div className="policy-result-title-group">
                    <div className="policy-result-icon">
                        <FileText size={20} />
                    </div>
                    <div>
                        <div className="policy-result-numero">{poliza.policyNumber}</div>
                        <div className="policy-result-tipo">{poliza.insuranceType}</div>
                    </div>
                </div>

                {poliza.status && (
                    <div className="policy-result-badges">
                        <span className={`policy-result-badge ${getEstadoClass(poliza.status)}`}>
                            {poliza.status}
                        </span>
                    </div>
                )}
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
                <DeletePolicyButton
                    polizaId={poliza.id}
                    numeroPoliza={poliza.policyNumber}
                    onEliminada={onEliminada}
                />
            </div>

            <PolicyPDFButton poliza={poliza} compania={compania} />

            <div className="client-result-grid">

                <div className="client-result-field">
                    <span className="client-result-label">Número de Referencia</span>
                    <span className={`client-result-value ${!poliza.referenceNumber ? "client-result-value--muted" : ""}`}>
                        {formatTexto(poliza.referenceNumber)}
                    </span>
                </div>

                <div className="client-result-field">
                    <span className="client-result-label">Método de Pago</span>
                    <span className="client-result-value">{poliza.paymentMethod ?? "-"}</span>
                </div>

                <div className="client-result-field">
                    <span className="client-result-label">Fecha de Inicio</span>
                    <span className="client-result-value">{formatFecha(poliza.startDate)}</span>
                </div>

                <div className="client-result-field">
                    <span className="client-result-label">Fecha de Vencimiento</span>
                    <span className="client-result-value">{formatFecha(poliza.expirationDate)}</span>
                </div>

                <div className="client-result-field">
                    <span className="client-result-label">Monto Total</span>
                    <span className="client-result-value">{formatMonto(poliza.totalAmount)}</span>
                </div>

                <div className="client-result-field">
                    <span className="client-result-label">Cuotas</span>
                    <span className="client-result-value">{poliza.installments ?? "-"}</span>
                </div>

                <div className="client-result-field">
                    <span className="client-result-label">Cliente</span>
                    <span className="client-result-value">
                        {poliza.client ? `${poliza.client.firstName} ${poliza.client.lastName}` : "-"}
                    </span>
                </div>

                <div className="client-result-field">
                    <span className="client-result-label">Broker</span>
                    <span className="client-result-value">{poliza.broker?.name ?? "-"}</span>
                </div>

                <div className="client-result-field">
                    <span className="client-result-label">Compañía</span>
                    <span className="client-result-value">{compania?.name ?? "-"}</span>
                </div>

                <div className="client-result-field">
                    <span className="client-result-label">Comisión</span>
                    <span className="client-result-value">
                        {compania?.commissionRate != null ? `${compania.commissionRate}%` : "-"}
                    </span>
                </div>

                <div className="client-result-field">
                    <span className="client-result-label">Cobertura</span>
                    <span className="client-result-value">{cobertura?.name ?? "-"}</span>
                </div>

            </div>

            {poliza.liabilityDetails && (
                <>
                    <div className="policy-result-section-title">Responsabilidad Civil</div>
                    <div className="client-result-grid">
                        <div className="client-result-field">
                            <span className="client-result-label">Actividad</span>
                            <span className="client-result-value">{poliza.liabilityDetails.activity}</span>
                        </div>
                        <div className="client-result-field">
                            <span className="client-result-label">Límite de Cobertura</span>
                            <span className="client-result-value">{formatMonto(poliza.liabilityDetails.coverageLimit)}</span>
                        </div>
                    </div>
                </>
            )}

            {poliza.bondDetails && (
                <>
                    <div className="policy-result-section-title">Fianza</div>
                    <div className="client-result-grid">
                        <div className="client-result-field">
                            <span className="client-result-label">Tipo de Fianza</span>
                            <span className="client-result-value">{poliza.bondDetails.bondType}</span>
                        </div>
                        <div className="client-result-field">
                            <span className="client-result-label">Monto Garantizado</span>
                            <span className="client-result-value">{formatMonto(poliza.bondDetails.guaranteedAmount)}</span>
                        </div>
                        <div className="client-result-field client-result-field--full">
                            <span className="client-result-label">Beneficiario</span>
                            <span className="client-result-value">{poliza.bondDetails.beneficiary}</span>
                        </div>
                    </div>
                </>
            )}

            {poliza.lifeDetails && (
                <>
                    <div className="policy-result-section-title">Vida</div>
                    <div className="client-result-grid">
                        <div className="client-result-field">
                            <span className="client-result-label">Suma Asegurada</span>
                            <span className="client-result-value">{formatMonto(poliza.lifeDetails.insuredAmount)}</span>
                        </div>
                        <div className="client-result-field">
                            <span className="client-result-label">Beneficiario</span>
                            <span className="client-result-value">{poliza.lifeDetails.beneficiary}</span>
                        </div>
                    </div>
                </>
            )}

            {poliza.otherDetails && (
                <>
                    <div className="policy-result-section-title">Otros</div>
                    <div className="client-result-grid">
                        <div className="client-result-field client-result-field--full">
                            <span className="client-result-label">Descripción</span>
                            <span className="client-result-value">{poliza.otherDetails.description}</span>
                        </div>
                    </div>
                </>
            )}

            {poliza.rentalDetails && (
                <>
                    <div className="policy-result-section-title">Alquiler</div>
                    <div className="client-result-grid">
                        <div className="client-result-field client-result-field--full">
                            <span className="client-result-label">Dirección</span>
                            <span className="client-result-value">{poliza.rentalDetails.address}</span>
                        </div>
                        <div className="client-result-field">
                            <span className="client-result-label">Tipo de Inmueble</span>
                            <span className="client-result-value">{poliza.rentalDetails.propertyType}</span>
                        </div>
                        <div className="client-result-field">
                            <span className="client-result-label">Valor de Alquiler</span>
                            <span className="client-result-value">{formatMonto(poliza.rentalDetails.rentAmount)}</span>
                        </div>
                    </div>
                </>
            )}

            {poliza.businessDetails && (
                <>
                    <div className="policy-result-section-title">Comercio</div>
                    <div className="client-result-grid">
                        <div className="client-result-field">
                            <span className="client-result-label">Razón Social</span>
                            <span className="client-result-value">{poliza.businessDetails.businessName}</span>
                        </div>
                        <div className="client-result-field">
                            <span className="client-result-label">Rubro</span>
                            <span className="client-result-value">{poliza.businessDetails.industry}</span>
                        </div>
                        <div className="client-result-field client-result-field--full">
                            <span className="client-result-label">Dirección</span>
                            <span className="client-result-value">{poliza.businessDetails.address}</span>
                        </div>
                    </div>
                </>
            )}

            {poliza.homeDetails && (
                <>
                    <div className="policy-result-section-title">Hogar</div>
                    <div className="client-result-grid">
                        <div className="client-result-field client-result-field--full">
                            <span className="client-result-label">Dirección</span>
                            <span className="client-result-value">{poliza.homeDetails.address}</span>
                        </div>
                        <div className="client-result-field">
                            <span className="client-result-label">Tipo de Construcción</span>
                            <span className="client-result-value">{poliza.homeDetails.constructionType}</span>
                        </div>
                        <div className="client-result-field">
                            <span className="client-result-label">Metros Cuadrados</span>
                            <span className="client-result-value">{poliza.homeDetails.squareMeters ?? "-"}</span>
                        </div>
                        <div className="client-result-field">
                            <span className="client-result-label">Valor de la Propiedad</span>
                            <span className="client-result-value">{formatMonto(poliza.homeDetails.propertyValue)}</span>
                        </div>
                    </div>
                </>
            )}

            {poliza.vehicleDetails && (
                <>
                    <div className="policy-result-section-title">Vehículo</div>
                    <div className="client-result-grid">
                        <div className="client-result-field">
                            <span className="client-result-label">Marca</span>
                            <span className="client-result-value">{poliza.vehicleDetails.brand}</span>
                        </div>
                        <div className="client-result-field">
                            <span className="client-result-label">Modelo</span>
                            <span className="client-result-value">{poliza.vehicleDetails.model}</span>
                        </div>
                        <div className="client-result-field">
                            <span className="client-result-label">Año</span>
                            <span className="client-result-value">{poliza.vehicleDetails.year}</span>
                        </div>
                        <div className="client-result-field">
                            <span className="client-result-label">Matrícula</span>
                            <span className="client-result-value">{poliza.vehicleDetails.licensePlate}</span>
                        </div>
                        <div className="client-result-field">
                            <span className="client-result-label">Padrón</span>
                            <span className="client-result-value">{poliza.vehicleDetails.registrationNumber}</span>
                        </div>
                        <div className="client-result-field">
                            <span className="client-result-label">Chasis</span>
                            <span className="client-result-value">{poliza.vehicleDetails.chassisNumber}</span>
                        </div>
                        <div className="client-result-field">
                            <span className="client-result-label">Motor</span>
                            <span className="client-result-value">{poliza.vehicleDetails.engineNumber}</span>
                        </div>
                    </div>
                </>
            )}

            {poliza.tripDetails && (
                <>
                    <div className="policy-result-section-title">Viaje</div>
                    <div className="client-result-grid">
                        <div className="client-result-field">
                            <span className="client-result-label">Destino</span>
                            <span className="client-result-value">{poliza.tripDetails.destination}</span>
                        </div>
                        <div className="client-result-field">
                            <span className="client-result-label">Fecha de Salida</span>
                            <span className="client-result-value">{formatFecha(poliza.tripDetails.departureDate)}</span>
                        </div>
                        <div className="client-result-field">
                            <span className="client-result-label">Fecha de Regreso</span>
                            <span className="client-result-value">{formatFecha(poliza.tripDetails.returnDate)}</span>
                        </div>
                        <div className="client-result-field">
                            <span className="client-result-label">Pasajeros</span>
                            <span className="client-result-value">{poliza.tripDetails.passengers}</span>
                        </div>
                    </div>
                </>
            )}

        </div>
    );
};

export default PolicyResult;