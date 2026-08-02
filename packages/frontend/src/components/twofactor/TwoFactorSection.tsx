import { useEffect, useState } from "react";
import { ShieldCheck, ShieldOff } from "lucide-react";
import api from "../../data/api"; 
import { toast } from "react-toastify";
import TwoFactorSetupModal from "./twoFactorSetupModal";
import type { TwoFactorConfirmResponse, TwoFactorSetupResponse } from "./twoFactor.types";

const TwoFactorSection = () => {
    const [enabled, setEnabled] = useState<boolean | null>(null);
    const [cargando, setCargando] = useState(true);
    const [setupData, setSetupData] = useState<TwoFactorSetupResponse | null>(null);

    const [mostrarSetup, setMostrarSetup] = useState(false);
    const [iniciandoSetup, setIniciandoSetup] = useState(false);

    const [mostrarDisable, setMostrarDisable] = useState(false);
    const [passwordDisable, setPasswordDisable] = useState("");
    const [codeDisable, setCodeDisable] = useState("");
    const [desactivando, setDesactivando] = useState(false);

    // Chequeo silencioso del estado: si /2fa/setup funciona, 2FA estaba apagado
    // (y de paso ya tenemos el QR/secret listos). Si falla con "ya esta activado",
    // sabemos que está prendido.
    useEffect(() => {
        api.post("/auth/2fa/setup")
            .then((response) => {
                setSetupData(response.data);
                setEnabled(false);
            })
            .catch((error) => {
                const msg: string = error.response?.data?.message ?? "";
                if (msg.toLowerCase().includes("ya esta activado") || msg.toLowerCase().includes("ya está activado")) {
                    setEnabled(true);
                } else {
                    setEnabled(false);
                }
            })
            .finally(() => setCargando(false));
    }, []);

    const handleAbrirActivacion = () => {
        if (setupData) {
            setMostrarSetup(true);
            return;
        }
        // Fallback por si el chequeo inicial no trajo datos
        setIniciandoSetup(true);
        api.post("/auth/2fa/setup")
            .then((response) => {
                setSetupData(response.data);
                setMostrarSetup(true);
            })
            .catch((error) => {
                toast.error(error.response?.data?.message ?? "No se pudo iniciar la activación de 2FA");
            })
            .finally(() => setIniciandoSetup(false));
    };

    const handleActivado = (_data: TwoFactorConfirmResponse) => {
        setEnabled(true);
        setMostrarSetup(false);
        setSetupData(null);
    };

    const handleDesactivar = () => {
        if (!passwordDisable || codeDisable.length !== 6) {
            toast.error("Ingresá tu contraseña y el código de 6 dígitos de tu app");
            return;
        }
        setDesactivando(true);
        api.post("/auth/2fa/disable", { password: passwordDisable, code: codeDisable })
            .then(() => {
                toast.success("Autenticación en dos pasos desactivada");
                setEnabled(false);
                setMostrarDisable(false);
                setPasswordDisable("");
                setCodeDisable("");
                setSetupData(null);
            })
            .catch((error) => {
                toast.error(error.response?.data?.message ?? "No se pudo desactivar. Revisá tus datos.");
            })
            .finally(() => setDesactivando(false));
    };

    return (
        <>
            <div className="settings-row">
                <div className="settings-row-text">
                    <span className="settings-row-label">Autenticación en dos pasos (2FA)</span>
                    <span className="settings-row-desc">
                        {cargando
                            ? "Cargando estado..."
                            : enabled
                                ? "Activada — tu cuenta pide un código además de la contraseña"
                                : "Desactivada — recomendamos activarla para mayor seguridad"}
                    </span>
                </div>

                {!cargando && (
                    enabled ? (
                        <button
                            type="button"
                            className="twofa-status-btn twofa-status-btn--enabled"
                            onClick={() => setMostrarDisable(true)}
                        >
                            <ShieldCheck size={15} />
                            Desactivar
                        </button>
                    ) : (
                        <button
                            type="button"
                            className="twofa-status-btn"
                            onClick={handleAbrirActivacion}
                            disabled={iniciandoSetup}
                        >
                            <ShieldOff size={15} />
                            {iniciandoSetup ? "Iniciando..." : "Activar 2FA"}
                        </button>
                    )
                )}
            </div>

            {mostrarSetup && setupData && (
                <TwoFactorSetupModal
                    setupData={setupData}
                    onClose={() => setMostrarSetup(false)}
                    onActivado={handleActivado}
                />
            )}

            {mostrarDisable && (
                <div className="confirm-modal-overlay" onClick={() => !desactivando && setMostrarDisable(false)}>
                    <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="confirm-modal-title">Desactivar autenticación en dos pasos</div>
                        <p className="confirm-modal-text">
                            Tu cuenta quedará protegida solo por contraseña. Confirmá con tu contraseña y
                            el código actual de tu app.
                        </p>

                        <input
                            type="password"
                            placeholder="Contraseña"
                            value={passwordDisable}
                            onChange={(e) => setPasswordDisable(e.target.value)}
                            className="twofa-password-input"
                            autoFocus
                        />

                        <input
                            type="text"
                            inputMode="numeric"
                            maxLength={6}
                            placeholder="Código de 6 dígitos"
                            value={codeDisable}
                            onChange={(e) => setCodeDisable(e.target.value.replace(/\D/g, ""))}
                            className="twofa-code-input"
                        />

                        <div className="confirm-modal-actions">
                            <button
                                type="button"
                                className="confirm-modal-btn confirm-modal-btn--cancel"
                                onClick={() => {
                                    setMostrarDisable(false);
                                    setPasswordDisable("");
                                    setCodeDisable("");
                                }}
                                disabled={desactivando}
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                className="confirm-modal-btn confirm-modal-btn--danger"
                                onClick={handleDesactivar}
                                disabled={desactivando}
                            >
                                {desactivando ? "Desactivando..." : "Desactivar"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default TwoFactorSection;