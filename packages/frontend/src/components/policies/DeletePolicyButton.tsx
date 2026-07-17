import { useState } from "react";
import { Trash2 } from "lucide-react";
import api from "../../data/api";
import { toast } from "react-toastify";

type Props = {
    polizaId: string;
    numeroPoliza: string;
    onEliminada: () => void;
};

const DeletePolicyButton = ({ polizaId, numeroPoliza, onEliminada }: Props) => {
    const [mostrarModal, setMostrarModal] = useState(false);
    const [eliminando, setEliminando] = useState(false);

    const handleConfirmar = () => {
        setEliminando(true);
        api.delete(`/polizas/${polizaId}`)
            .then((response) => {
                toast.success(response.data?.message ?? "Póliza eliminada correctamente");
                setMostrarModal(false);
                onEliminada();
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
                Eliminar póliza
            </button>

            {mostrarModal && (
                <div className="confirm-modal-overlay" onClick={() => !eliminando && setMostrarModal(false)}>
                    <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="confirm-modal-title">¿Eliminar póliza?</div>
                        <p className="confirm-modal-text">
                            Esta acción eliminará la póliza <strong>{numeroPoliza}</strong> de forma
                            permanente. No se puede deshacer.
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

export default DeletePolicyButton;