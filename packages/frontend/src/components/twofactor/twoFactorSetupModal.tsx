import { useState } from "react";
import { Copy, Check } from "lucide-react";
import api from "../../data/api";
import { toast } from "react-toastify";
import TwoFactorBackupCodesModal from "./TwoFactorBackupCodesModal";
import type { TwoFactorConfirmResponse, TwoFactorSetupResponse } from "./twoFactor.types";

type Props = {
    setupData: TwoFactorSetupResponse;
    onClose: () => void;
    onActivado: (data: TwoFactorConfirmResponse) => void;
};

const TwoFactorSetupModal = ({ setupData, onClose, onActivado }: Props) => {
    const [codigo, setCodigo] = useState("");
    const [verificando, setVerificando] = useState(false);
    const [copiado, setCopiado] = useState(false);
    const [backupData, setBackupData] = useState<TwoFactorConfirmResponse | null>(null);

    const handleCopiarSecret = () => {
        navigator.clipboard.writeText(setupData.secret).then(() => {
            setCopiado(true);
            setTimeout(() => setCopiado(false), 2000);
        });
    };

    const handleConfirmar = () => {
        if (codigo.trim().length !== 6) {
            toast.error("Ingresá el código de 6 dígitos de tu app");
            return;
        }
        setVerificando(true);
        api.post("/auth/2fa/confirm", { code: codigo.trim() })
            .then((response) => {
                toast.success("Código verificado correctamente");
                setBackupData(response.data);
            })
            .catch((error) => {
                toast.error(error.response?.data?.message ?? "Código inválido, intentá de nuevo");
            })
            .finally(() => setVerificando(false));
    };

    if (backupData) {
        return (
            <TwoFactorBackupCodesModal
                data={backupData}
                onCerrar={() => onActivado(backupData)}
            />
        );
    }

    return (
        <div className="confirm-modal-overlay" onClick={onClose}>
            <div className="confirm-modal twofa-setup-modal" onClick={(e) => e.stopPropagation()}>
                <div className="confirm-modal-title">Activar autenticación en dos pasos</div>
                <p className="confirm-modal-text">
                    Escaneá este código QR con Google Authenticator, Microsoft Authenticator o cualquier
                    app compatible con TOTP.
                </p>

                <div className="twofa-qr-wrapper">
                    <img src={setupData.qrCode} alt="Código QR para 2FA" className="twofa-qr-image" />
                </div>

                <p className="confirm-modal-text">
                    ¿No podés escanear? Ingresá este código manualmente en tu app:
                </p>

                <div className="twofa-secret-row">
                    <code className="twofa-secret-code">{setupData.secret}</code>
                    <button type="button" className="twofa-copy-btn" onClick={handleCopiarSecret}>
                        {copiado ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                </div>

                <label className="twofa-code-label" htmlFor="twofa-code">
                    Código de 6 dígitos
                </label>
                <input
                    id="twofa-code"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="000000"
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ""))}
                    className="twofa-code-input"
                    autoFocus
                />

                <div className="confirm-modal-actions">
                    <button
                        type="button"
                        className="confirm-modal-btn confirm-modal-btn--cancel"
                        onClick={onClose}
                        disabled={verificando}
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        className="confirm-modal-btn confirm-modal-btn--primary"
                        onClick={handleConfirmar}
                        disabled={verificando || codigo.length !== 6}
                    >
                        {verificando ? "Verificando..." : "Confirmar"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TwoFactorSetupModal;