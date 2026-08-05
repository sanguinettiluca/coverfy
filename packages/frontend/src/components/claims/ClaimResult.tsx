import { AlertTriangle } from "lucide-react";
import DeleteClaimButton from "./DeleteClaimButton";
import type { Claim } from "./claim.types";

type Props = {
    claim: Claim;
    onEliminado: () => void;
};

const formatFecha = (fecha?: string | null) =>
    fecha ? new Date(fecha).toLocaleDateString("es-UY") : "-";

const getEstadoClass = (status: string) =>
    status === "OPEN" ? "policy-result-badge--suspendida" : "policy-result-badge--activa";

const getEstadoLabel = (status: string) =>
    status === "OPEN" ? "Abierto" : "Cerrado";

const ClaimResult = ({ claim, onEliminado }: Props) => {
    return (
        <div>
            <div className="policy-result-header">
                <div className="policy-result-title-group">
                    <div className="policy-result-icon">
                        <AlertTriangle size={20} />
                    </div>
                    <div>
                        <div className="policy-result-numero">
                            {claim.policy.policyNumber}
                            {claim.policy.referenceNumber ? ` · Ref. ${claim.policy.referenceNumber}` : ""}
                        </div>
                        <div className="policy-result-tipo">
                            {claim.policy.vehicleDetails?.brand} {claim.policy.vehicleDetails?.model} —{" "}
                            {claim.policy.vehicleDetails?.licensePlate}
                        </div>
                    </div>
                </div>
                <div className="policy-result-badges">
                    <span className={`policy-result-badge ${getEstadoClass(claim.status)}`}>
                        {getEstadoLabel(claim.status)}
                    </span>
                </div>
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
                <DeleteClaimButton
                    claimId={claim.id}
                    policyNumber={claim.policy.policyNumber}
                    onEliminado={onEliminado}
                />
            </div>

            <div className="client-result-grid">
                <div className="client-result-field">
                    <span className="client-result-label">Número de Referencia</span>
                    <span className={`client-result-value ${!claim.policy.referenceNumber ? "client-result-value--muted" : ""}`}>
                        {claim.policy.referenceNumber || "-"}
                    </span>
                </div>

                <div className="client-result-field">
                    <span className="client-result-label">Cliente</span>
                    <span className="client-result-value">
                        {claim.policy.client
                            ? `${claim.policy.client.firstName} ${claim.policy.client.lastName}`
                            : "-"}
                    </span>
                </div>

                <div className="client-result-field">
                    <span className="client-result-label">Fecha del Siniestro</span>
                    <span className="client-result-value">{formatFecha(claim.incidentDate)}</span>
                </div>

                <div className="client-result-field">
                    <span className="client-result-label">Fecha de Contacto</span>
                    <span className="client-result-value">{formatFecha(claim.contactDate)}</span>
                </div>

                <div className="client-result-field client-result-field--full">
                    <span className="client-result-label">Notas</span>
                    <span className={`client-result-value ${!claim.notes ? "client-result-value--muted" : ""}`}>
                        {claim.notes || "-"}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default ClaimResult;