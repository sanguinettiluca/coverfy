import { useEffect, useState } from "react";
import api from "../../data/api"; // ajustá el path real
import type { QuickMessage } from "./quickMessage.types"; // ajustá el path real

type WhatsappMessageButtonProps = {
    phone: string;
};

const WhatsappMessageButton = ({ phone }: WhatsappMessageButtonProps) => {

    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [quickMessages, setQuickMessages] = useState<QuickMessage[]>([]);
    const [selectedQuickMessageId, setSelectedQuickMessageId] = useState("");

    useEffect(() => {
        if (!open) return;
        api.get("/mensajes-rapidos")
            .then((response) => setQuickMessages(response.data ?? []))
            .catch(() => setQuickMessages([]));
    }, [open]);

    const handleSelectQuickMessage = (id: string) => {
        setSelectedQuickMessageId(id);
        const found = quickMessages.find((m) => m.id === id);
        if (found) {
            setMessage(found.message);
        }
    };

    const sendWhatsapp = () => {
        const cleanPhone = phone.replace(/\D/g, "");

        const url = `https://api.whatsapp.com/send/?phone=${cleanPhone}&text=${encodeURIComponent(message)}&type=phone_number&app_absent=0`;

        window.open(url, "_blank");

        setOpen(false);
        setMessage("");
        setSelectedQuickMessageId("");
    };

    return (
        <>
            <button 
                type="button"
                className="client-result-value"
                onClick={() => setOpen(true)}
            >
                +{phone}
            </button>


            {open && (
                <div className="whatsapp-modal-overlay">

                    <div className="whatsapp-modal">

                        <div className="whatsapp-modal-title">
                            Enviar WhatsApp
                        </div>

                        <div className="whatsapp-modal-text">
                            Escribe el mensaje que quieres enviar al cliente.
                        </div>

                        {quickMessages.length > 0 && (
                            <select
                                value={selectedQuickMessageId}
                                onChange={(e) => handleSelectQuickMessage(e.target.value)}
                                style={{ marginBottom: "10px" }}
                            >
                                <option value="">Elegir un mensaje rápido...</option>
                                {quickMessages.map((m) => (
                                    <option key={m.id} value={m.id}>{m.name}</option>
                                ))}
                            </select>
                        )}

                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Ej: Su póliza está próxima a vencer..."
                        />

                        <div className="whatsapp-modal-actions">

                            <button
                                className="whatsapp-modal-btn whatsapp-modal-btn--cancel"
                                onClick={() => setOpen(false)}
                            >
                                Cancelar
                            </button>

                            <button
                                className="whatsapp-modal-btn whatsapp-modal-btn--send"
                                onClick={sendWhatsapp}
                                disabled={!message.trim()}
                            >
                                Enviar
                            </button>

                        </div>

                    </div>

                </div>
            )}
        </>
    );
};

export default WhatsappMessageButton;