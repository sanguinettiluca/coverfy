import { useState } from "react";

type WhatsappMessageButtonProps = {
    phone: string;
};

const WhatsappMessageButton = ({ phone }: WhatsappMessageButtonProps) => {

    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState("");

    const sendWhatsapp = () => {
        const cleanPhone = phone.replace(/\D/g, "");

        const url = `https://api.whatsapp.com/send/?phone=${cleanPhone}&text=${encodeURIComponent(message)}&type=phone_number&app_absent=0`;

        window.open(url, "_blank");

        setOpen(false);
        setMessage("");
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