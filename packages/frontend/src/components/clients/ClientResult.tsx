import PolizaAccordion from "./PolizaAccordion";
import DeleteClientButton from "./DelteClientButton";

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

type Cliente = {
    id: string;
    nombres: string;
    apellidos: string;
    documento: string;
    fechaNacimiento?: string | null;
    celular: string;
    celularAlternativo?: string | null;
    email: string;
    direccion: string;
    notas?: string | null;
    creadoPorId: string;
    brokerId: string;
    createdAt: string;
    creadoPor?: { id: string; nombre: string; role: string };
    polizas: Poliza[];
};

type ClientResultProps = {
    cliente: Cliente;
    onEliminado: () => void;
};

const formatFecha = (fecha?: string | null) =>
    fecha ? new Date(fecha).toLocaleDateString("es-UY") : "-";

const formatTexto = (valor?: string | null) =>
    valor && valor.trim() !== "" ? valor : "-";

const getIniciales = (nombres: string, apellidos: string) =>
    `${nombres.charAt(0)}${apellidos.charAt(0)}`.toUpperCase();

const ClientResult = ({ cliente, onEliminado }: ClientResultProps) => {
    const polizas = cliente.polizas ?? [];

    return (
        <div>

            <div className="client-result-header">
                <div className="client-result-avatar">
                    {getIniciales(cliente.nombres, cliente.apellidos)}
                </div>
                <div>
                    <div className="client-result-name">
                        {cliente.nombres} {cliente.apellidos}
                    </div>
                    <div className="client-result-doc">Documento {cliente.documento}</div>
                </div>
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
                <DeleteClientButton
                    clienteId={cliente.id}
                    nombreCompleto={`${cliente.nombres} ${cliente.apellidos}`}
                    cantidadPolizas={polizas.length}
                    onEliminado={onEliminado}
                />
            </div>

            <div className="client-result-grid">

                <div className="client-result-field">
                    <span className="client-result-label">Fecha de Nacimiento</span>
                    <span className="client-result-value">{formatFecha(cliente.fechaNacimiento)}</span>
                </div>

                <div className="client-result-field">
                    <span className="client-result-label">Celular</span>
                    <span className="client-result-value">{cliente.celular}</span>
                </div>

                <div className="client-result-field">
                    <span className="client-result-label">Celular Alternativo</span>
                    <span className={`client-result-value ${!cliente.celularAlternativo ? "client-result-value--muted" : ""}`}>
                        {formatTexto(cliente.celularAlternativo)}
                    </span>
                </div>

                <div className="client-result-field">
                    <span className="client-result-label">Email</span>
                    <span className="client-result-value">{cliente.email}</span>
                </div>

                <div className="client-result-field client-result-field--full">
                    <span className="client-result-label">Dirección</span>
                    <span className="client-result-value">{cliente.direccion}</span>
                </div>

                <div className="client-result-field client-result-field--full">
                    <span className="client-result-label">Notas</span>
                    <span className={`client-result-value ${!cliente.notas ? "client-result-value--muted" : ""}`}>
                        {formatTexto(cliente.notas)}
                    </span>
                </div>

                <div className="client-result-field">
                    <span className="client-result-label">Creado por</span>
                    <span className="client-result-value">{cliente.creadoPor?.nombre ?? "-"}</span>
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