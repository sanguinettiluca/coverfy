import { useState } from "react";
import { Trash2 } from "lucide-react";
import api from "../../data/api";
import { toast } from "react-toastify";

type Props = {
    clienteId: string;
    nombreCompleto: string;
    cantidadPolizas?: number;
    onEliminado: () => void;
};

const DeleteClientButton = ({ clienteId, nombreCompleto, cantidadPolizas = 0, onEliminado }: Props) => {
    const [mostrarModal, setMostrarModal] = useState(false);
    const [eliminando, setEliminando] = useState(false);

    const handleConfirmar = () => {
        setEliminando(true);
        api.delete(`/clientes/${clienteId}`)
            .then((response) => {
                toast.success(response.data?.message ?? "Cliente eliminado correctamente");
                setMostrarModal(false);
                onEliminado();
            })
            .catch((error) => {
                if (error.response) {
                    toast.error(error.response.data.message);
                } else {
                    console.error("Error de conexión:", error.message);
                }
            })
            .finally(() => setEliminando(false));
    };

    return (
        <>
            <button
                type="button"
                className="delete-policy-btn"
                onClick={() => setMostrarModal(true)}
            >
                <Trash2 size={14} />
                Eliminar cliente
            </button>

            {mostrarModal && (
                <div className="confirm-modal-overlay" onClick={() => !eliminando && setMostrarModal(false)}>
                    <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="confirm-modal-title">¿Eliminar cliente?</div>
                        <p className="confirm-modal-text">
                            Esta acción eliminará al cliente <strong>{nombreCompleto}</strong> de forma
                            permanente. No se puede deshacer.
                            {cantidadPolizas > 0 && (
                                <>
                                    {" "}
                                    También se eliminarán sus{" "}
                                    <strong>
                                        {cantidadPolizas} {cantidadPolizas === 1 ? "póliza" : "pólizas"}
                                    </strong>{" "}
                                    asociadas.
                                </>
                            )}
                        </p>
                        <div className="confirm-modal-actions">
                            <button
                                type="button"
                                className="confirm-modal-btn confirm-modal-btn--cancel"
                                onClick={() => setMostrarModal(false)}
                                disabled={eliminando}
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                className="confirm-modal-btn confirm-modal-btn--danger"
                                onClick={handleConfirmar}
                                disabled={eliminando}
                            >
                                {eliminando ? "Eliminando..." : "Eliminar"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default DeleteClientButton;