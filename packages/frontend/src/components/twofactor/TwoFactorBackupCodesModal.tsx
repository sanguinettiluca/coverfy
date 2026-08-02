import { useState } from "react";
import { Download, Copy, Check } from "lucide-react";
import type { TwoFactorConfirmResponse } from "./twoFactor.types";

type Props = {
    data: TwoFactorConfirmResponse;
    onCerrar: () => void;
};

const TwoFactorBackupCodesModal = ({ data, onCerrar }: Props) => {
    const [guardeConfirmado, setGuardeConfirmado] = useState(false);
    const [copiado, setCopiado] = useState(false);

    const handleCopiarTodos = () => {
        navigator.clipboard.writeText(data.backupCodes.join("\n")).then(() => {
            setCopiado(true);
            setTimeout(() => setCopiado(false), 2000);
        });
    };

    const handleDescargar = () => {
        const blob = new Blob([data.backupCodes.join("\n")], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "coverfy-codigos-respaldo-2fa.txt";
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="confirm-modal-overlay">
            <div className="confirm-modal twofa-setup-modal">
                <div className="confirm-modal-title">2FA activado — guardá tus códigos de respaldo</div>
                <p className="confirm-modal-text">
                    Estos 8 códigos son de un solo uso cada uno. Te van a servir para entrar si perdés
                    acceso a tu app de autenticación. <strong>No se van a volver a mostrar.</strong>
                </p>

                <div className="twofa-backup-grid">
                    {data.backupCodes.map((code, i) => (
                        <code key={i} className="twofa-backup-code">{code}</code>
                    ))}
                </div>

                <div className="twofa-backup-actions">
                    <button type="button" className="twofa-copy-btn twofa-copy-btn--wide" onClick={handleCopiarTodos}>
                        {copiado ? <Check size={14} /> : <Copy size={14} />}
                        {copiado ? "Copiado" : "Copiar todos"}
                    </button>
                    <button type="button" className="twofa-copy-btn twofa-copy-btn--wide" onClick={handleDescargar}>
                        <Download size={14} />
                        Descargar
                    </button>
                </div>

                <label className="twofa-checkbox-row">
                    <input
                        type="checkbox"
                        checked={guardeConfirmado}
                        onChange={(e) => setGuardeConfirmado(e.target.checked)}
                    />
                    Ya guardé estos códigos en un lugar seguro
                </label>

                <div className="confirm-modal-actions">
                    <button
                        type="button"
                        className="confirm-modal-btn confirm-modal-btn--primary"
                        onClick={onCerrar}
                        disabled={!guardeConfirmado}
                    >
                        Listo
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TwoFactorBackupCodesModal;