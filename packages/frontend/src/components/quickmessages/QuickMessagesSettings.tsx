import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import api from "../../data/api";
import { toast } from "react-toastify";
import type { QuickMessage, QuickMessageForm } from "./quickMessage.types";

const QuickMessagesSettings = () => {
    const [messages, setMessages] = useState<QuickMessage[]>([]);
    const [cargando, setCargando] = useState(true);

    const [mostrarForm, setMostrarForm] = useState(false);
    const [editando, setEditando] = useState<QuickMessage | null>(null);
    const [form, setForm] = useState<QuickMessageForm>({ name: "", message: "" });
    const [guardando, setGuardando] = useState(false);

    const [eliminandoId, setEliminandoId] = useState<string | null>(null);

    const cargarMensajes = () => {
        setCargando(true);
        api.get("/mensajes-rapidos")
            .then((response) => setMessages(response.data ?? []))
            .catch(() => setMessages([]))
            .finally(() => setCargando(false));
    };

    useEffect(() => {
        cargarMensajes();
    }, []);

    const abrirNuevo = () => {
        setEditando(null);
        setForm({ name: "", message: "" });
        setMostrarForm(true);
    };

    const abrirEditar = (msg: QuickMessage) => {
        setEditando(msg);
        setForm({ name: msg.name, message: msg.message });
        setMostrarForm(true);
    };

    const handleGuardar = () => {
        if (!form.name.trim() || !form.message.trim()) {
            toast.error("Completá el nombre y el mensaje");
            return;
        }

        setGuardando(true);

        const request = editando
            ? api.put(`/mensajes-rapidos/${editando.id}`, form)
            : api.post("/mensajes-rapidos", form);

        request
            .then((response) => {
                toast.success(response.data?.message ?? "Mensaje guardado correctamente");
                setMostrarForm(false);
                cargarMensajes();
            })
            .catch((error) => {
                toast.error(error.response?.data?.message ?? "No se pudo guardar el mensaje");
            })
            .finally(() => setGuardando(false));
    };

    const handleEliminar = (id: string) => {
        setEliminandoId(id);
        api.delete(`/mensajes-rapidos/${id}`)
            .then((response) => {
                toast.success(response.data?.message ?? "Mensaje eliminado correctamente");
                setMessages((prev) => prev.filter((m) => m.id !== id));
            })
            .catch((error) => {
                toast.error(error.response?.data?.message ?? "No se pudo eliminar el mensaje");
            })
            .finally(() => setEliminandoId(null));
    };

    return (
        <div>
            <div className="quickmsg-header">
                <span className="quickmsg-header-desc">
                    Plantillas de WhatsApp para enviar a tus clientes
                </span>
                <button type="button" className="twofa-status-btn" onClick={abrirNuevo}>
                    <Plus size={15} />
                    Nuevo
                </button>
            </div>

            {cargando && <p className="dashboard-widget-loading">Cargando...</p>}

            {!cargando && messages.length === 0 && (
                <p className="dashboard-widget-empty">Todavía no cargaste ningún mensaje rápido</p>
            )}

            {!cargando && messages.length > 0 && (
                <div className="quickmsg-list">
                    {messages.map((msg) => (
                        <div className="quickmsg-item" key={msg.id}>
                            <div className="quickmsg-item-main">
                                <span className="quickmsg-item-title">{msg.name}</span>
                                <span className="quickmsg-item-sub">{msg.message}</span>
                            </div>
                            <div className="quickmsg-item-actions">
                                <button
                                    type="button"
                                    className="twofa-copy-btn"
                                    onClick={() => abrirEditar(msg)}
                                >
                                    <Pencil size={14} />
                                </button>
                                <button
                                    type="button"
                                    className="twofa-copy-btn"
                                    onClick={() => handleEliminar(msg.id)}
                                    disabled={eliminandoId === msg.id}
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {mostrarForm && (
                <div className="confirm-modal-overlay" onClick={() => !guardando && setMostrarForm(false)}>
                    <div className="confirm-modal twofa-setup-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="confirm-modal-title">
                            {editando ? "Editar mensaje rápido" : "Nuevo mensaje rápido"}
                        </div>

                        <label className="twofa-code-label" htmlFor="qm-name">Nombre</label>
                        <input
                            id="qm-name"
                            type="text"
                            placeholder="Ej: Recordatorio de vencimiento"
                            value={form.name}
                            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                            className="twofa-password-input"
                        />

                        <label className="twofa-code-label" htmlFor="qm-message">Mensaje</label>
                        <textarea
                            id="qm-message"
                            placeholder="Ej: Hola! Te recuerdo que tu póliza vence pronto..."
                            value={form.message}
                            onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                            rows={4}
                            style={{ marginBottom: "1rem" }}
                        />

                        <div className="confirm-modal-actions">
                            <button
                                type="button"
                                className="confirm-modal-btn confirm-modal-btn--cancel"
                                onClick={() => setMostrarForm(false)}
                                disabled={guardando}
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                className="confirm-modal-btn confirm-modal-btn--primary"
                                onClick={handleGuardar}
                                disabled={guardando}
                            >
                                {guardando ? "Guardando..." : "Guardar"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuickMessagesSettings;