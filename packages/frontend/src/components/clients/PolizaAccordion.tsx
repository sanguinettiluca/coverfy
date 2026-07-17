import { useState } from "react";
import { ChevronDown } from "lucide-react";

type Poliza = {
    id: string;
    numeroPoliza: string;
    numeroReferencia?: string | null;
    tipoSeguro: string;
    estado?: string | null;
    fechaInicio?: string | null;
    fechaVencimiento?: string | null;
    montoTotal?: number | null;
    cuotas?: number | null;
    metodoPago?: string | null;
    clienteId: string;
    companiaId: string;
    coberturaId?: string | null;
    brokerId: string;
    createdAt: string;
    updatedAt: string;
};

type PolizaAccordionProps = {
    poliza: Poliza;
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
                    <span className="poliza-accordion-numero">{poliza.numeroPoliza}</span>
                    <span className="poliza-accordion-tipo">{poliza.tipoSeguro}</span>
                </div>

                <div className="poliza-accordion-right">
                    {poliza.estado && (
                        <span className={`poliza-accordion-estado ${getEstadoClass(poliza.estado)}`}>
                            {poliza.estado}
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
                        <span className={`poliza-accordion-value ${!poliza.numeroReferencia ? "poliza-accordion-value--muted" : ""}`}>
                            {formatTexto(poliza.numeroReferencia)}
                        </span>
                    </div>

                    <div className="poliza-accordion-field">
                        <span className="poliza-accordion-label">Método de Pago</span>
                        <span className="poliza-accordion-value">{poliza.metodoPago ?? "-"}</span>
                    </div>

                    <div className="poliza-accordion-field">
                        <span className="poliza-accordion-label">Fecha de Inicio</span>
                        <span className="poliza-accordion-value">{formatFecha(poliza.fechaInicio)}</span>
                    </div>

                    <div className="poliza-accordion-field">
                        <span className="poliza-accordion-label">Fecha de Vencimiento</span>
                        <span className="poliza-accordion-value">{formatFecha(poliza.fechaVencimiento)}</span>
                    </div>

                    <div className="poliza-accordion-field">
                        <span className="poliza-accordion-label">Monto Total</span>
                        <span className="poliza-accordion-value">{formatMonto(poliza.montoTotal)}</span>
                    </div>

                    <div className="poliza-accordion-field">
                        <span className="poliza-accordion-label">Cuotas</span>
                        <span className="poliza-accordion-value">{poliza.cuotas ?? "-"}</span>
                    </div>

                </div>
            )}
        </div>
    );
};

export default PolizaAccordion;