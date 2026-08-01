import { useState } from "react";
import { ChevronDown } from "lucide-react";

type Policy = {
    id: string;
    policyNumber: string;
    referenceNumber?: string | null;
    insuranceType: string;
    status?: string | null;
    startDate?: string | null;
    expirationDate?: string | null;
    totalAmount?: number | null;
    installments?: number | null;
    paymentMethod?: string | null;
    clientId: string;
    companyId: string;
    coverageId?: string | null;
    brokerId: string;
    createdAt: string;
    updatedAt: string;
};


type PolizaAccordionProps = {
    poliza: Policy;
};

const formatFecha = (fecha?: string | null) =>
    fecha ? new Date(fecha).toLocaleDateString("es-UY") : "-";

const formatMonto = (monto?: number | null) =>
    monto != null ? `$${monto.toFixed(2)}` : "-";

const formatTexto = (valor?: string | null) =>
    valor && valor.trim() !== "" ? valor : "-";

const getEstadoClass = (estado?: string | null) => {
    switch (estado) {
        case "ACTIVA":
            return "poliza-accordion-estado--activa";
        case "VENCIDA":
            return "poliza-accordion-estado--vencida";
        case "CANCELADA":
            return "poliza-accordion-estado--cancelada";
        case "PENDIENTE":
            return "poliza-accordion-estado--pendiente";
        default:
            return "";
    }
};

const PolizaAccordion = ({ poliza }: PolizaAccordionProps) => {
    const [abierto, setAbierto] = useState(false);

    return (
        <div className="poliza-accordion">
            <button
                type="button"
                className="poliza-accordion-header"
                onClick={() => setAbierto((prev) => !prev)}
            >
                <div className="poliza-accordion-title">
                    <span className="poliza-accordion-numero">{poliza.policyNumber}</span>
                    <span className="poliza-accordion-tipo">{poliza.insuranceType}</span>
                </div>

                <div className="poliza-accordion-right">
                    {poliza.status && (
                        <span className={`poliza-accordion-estado ${getEstadoClass(poliza.status)}`}>
                            {poliza.status}
                        </span>
                    )}
                    <ChevronDown
                        size={18}
                        className="poliza-accordion-chevron"
                        style={{
                            transform: abierto ? "rotate(180deg)" : "rotate(0deg)",
                            transition: "transform 0.2s ease",
                        }}
                    />
                </div>
            </button>

            {abierto && (
                <div className="poliza-accordion-body">

                    <div className="poliza-accordion-field">
                        <span className="poliza-accordion-label">Número de Referencia</span>
                        <span className={`poliza-accordion-value ${!poliza.referenceNumber ? "poliza-accordion-value--muted" : ""}`}>
                            {formatTexto(poliza.referenceNumber)}
                        </span>
                    </div>

                    <div className="poliza-accordion-field">
                        <span className="poliza-accordion-label">Método de Pago</span>
                        <span className="poliza-accordion-value">{poliza.paymentMethod ?? "-"}</span>
                    </div>

                    <div className="poliza-accordion-field">
                        <span className="poliza-accordion-label">Fecha de Inicio</span>
                        <span className="poliza-accordion-value">{formatFecha(poliza.startDate)}</span>
                    </div>

                    <div className="poliza-accordion-field">
                        <span className="poliza-accordion-label">Fecha de Vencimiento</span>
                        <span className="poliza-accordion-value">{formatFecha(poliza.expirationDate)}</span>
                    </div>

                    <div className="poliza-accordion-field">
                        <span className="poliza-accordion-label">Monto Total</span>
                        <span className="poliza-accordion-value">{formatMonto(poliza.totalAmount)}</span>
                    </div>

                    <div className="poliza-accordion-field">
                        <span className="poliza-accordion-label">Cuotas</span>
                        <span className="poliza-accordion-value">{poliza.installments ?? "-"}</span>
                    </div>

                </div>
            )}
        </div>
    );
};

export default PolizaAccordion;