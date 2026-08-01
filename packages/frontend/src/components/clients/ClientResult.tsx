import PolizaAccordion from "./PolizaAccordion";
import DeleteClientButton from "./DelteClientButton";
import WhatsAppMessage from "./WhatsAppMessage";

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

type Client = {
    id: string;
    firstName: string;
    lastName: string;
    documentNumber: string;
    dateOfBirth?: string | null;
    phone: string;
    alternatePhone?: string | null;
    email: string;
    address: string;
    notes?: string | null;
    createdById: string;
    brokerId: string;
    createdAt: string;
    createdBy?: { id: string; name: string; role: string };
    policies: Policy[];
};

type ClientResultProps = {
    cliente: Client;
    onEliminado: () => void;
};

const formatFecha = (fecha?: string | null) =>
    fecha ? new Date(fecha).toLocaleDateString("es-UY") : "-";

const formatTexto = (valor?: string | null) =>
    valor && valor.trim() !== "" ? valor : "-";

const getIniciales = (nombres: string, apellidos: string) =>
    `${nombres.charAt(0)}${apellidos.charAt(0)}`.toUpperCase();

const ClientResult = ({ cliente, onEliminado }: ClientResultProps) => {
    const polizas = cliente.policies ?? [];

    return (
        <div>

            <div className="client-result-header">
                <div className="client-result-avatar">
                    {getIniciales(cliente.firstName, cliente.lastName)}
                </div>
                <div>
                    <div className="client-result-name">
                        {cliente.firstName} {cliente.lastName}
                    </div>
                    <div className="client-result-doc">Documento {cliente.documentNumber}</div>
                </div>
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
                <DeleteClientButton
                    clienteId={cliente.id}
                    nombreCompleto={`${cliente.firstName} ${cliente.lastName}`}
                    cantidadPolizas={polizas.length}
                    onEliminado={onEliminado}
                />
            </div>

            <div className="client-result-grid">

                <div className="client-result-field">
                    <span className="client-result-label">Fecha de Nacimiento</span>
                    <span className="client-result-value">{formatFecha(cliente.dateOfBirth)}</span>
                </div>

                <div className="client-result-field">
                    <span className="client-result-label">Celular</span>
                    <WhatsAppMessage phone={cliente.phone} />
                </div>

                <div className="client-result-field">
                    <span className="client-result-label">Celular Alternativo</span>
                    {cliente.alternatePhone ? (
                        <WhatsAppMessage phone={cliente.alternatePhone} />
                    ) : (
                        <span className="client-result-value client-result-value--muted">-</span>
                    )}
                </div>

                <div className="client-result-field">
                    <span className="client-result-label">Email</span>
                    <span className="client-result-value">{cliente.email}</span>
                </div>

                <div className="client-result-field client-result-field--full">
                    <span className="client-result-label">Dirección</span>
                    <span className="client-result-value">{cliente.address}</span>
                </div>

                <div className="client-result-field client-result-field--full">
                    <span className="client-result-label">Notas</span>
                    <span className={`client-result-value ${!cliente.notes ? "client-result-value--muted" : ""}`}>
                        {formatTexto(cliente.notes)}
                    </span>
                </div>

                <div className="client-result-field">
                    <span className="client-result-label">Creado por</span>
                    <span className="client-result-value">{cliente.createdBy?.name ?? "-"}</span>
                </div>

            </div>

            <div className="client-result-section">
                <div className="client-result-section-title">
                    Pólizas
                    <span className="client-result-section-count">{polizas.length}</span>
                </div>

                {polizas.length === 0 ? (
                    <p className="client-result-empty">Este cliente no tiene pólizas registradas</p>
                ) : (
                    polizas.map((poliza) => (
                        <PolizaAccordion key={poliza.id} poliza={poliza} />
                    ))
                )}
            </div>

        </div>
    );
};

export default ClientResult;