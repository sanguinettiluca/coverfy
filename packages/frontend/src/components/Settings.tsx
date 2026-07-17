import { useTheme } from "../hooks/useTheme"
import { useState } from "react";

const Settings = () => {
    const { isDark, toggleTheme } = useTheme();

    const [notificaciones, setNotificaciones] = useState(true);
    const [vistaCompacta, setVistaCompacta] = useState(false);

    return (
        <div className="settings-page">

            <div className="settings-header">
                <h1 className="settings-title">Configuración</h1>
                <p className="settings-sub">Personaliza tu experiencia en la aplicación</p>
            </div>

            <div className="settings-section">
                <div className="settings-section-title">Apariencia</div>

                <div className="settings-row">
                    <div className="settings-row-text">
                        <span className="settings-row-label">Modo oscuro</span>
                        <span className="settings-row-desc">
                            {isDark ? "Activado" : "Desactivado"}
                        </span>
                    </div>
                    <button
                        type="button"
                        className={`settings-toggle ${isDark ? "settings-toggle--on" : ""}`}
                        onClick={toggleTheme}
                        aria-pressed={isDark}
                        aria-label="Alternar modo oscuro"
                    />
                </div>

                <div className="settings-row">
                    <div className="settings-row-text">
                        <span className="settings-row-label">Vista compacta</span>
                        <span className="settings-row-desc">Reduce el espaciado entre elementos</span>
                    </div>
                    <button
                        type="button"
                        className={`settings-toggle ${vistaCompacta ? "settings-toggle--on" : ""}`}
                        onClick={() => setVistaCompacta((prev) => !prev)}
                        aria-pressed={vistaCompacta}
                        aria-label="Alternar vista compacta"
                    />
                </div>
            </div>

            <div className="settings-section">
                <div className="settings-section-title">Notificaciones</div>

                <div className="settings-row">
                    <div className="settings-row-text">
                        <span className="settings-row-label">Notificaciones activas</span>
                        <span className="settings-row-desc">Recibí avisos de pólizas por vencer</span>
                    </div>
                    <button
                        type="button"
                        className={`settings-toggle ${notificaciones ? "settings-toggle--on" : ""}`}
                        onClick={() => setNotificaciones((prev) => !prev)}
                        aria-pressed={notificaciones}
                        aria-label="Alternar notificaciones"
                    />
                </div>
            </div>

        </div>
    );
};

export default Settings;