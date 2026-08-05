import { useState } from "react";
import { Pencil, Trash2, Check, X } from "lucide-react";
import api from "../../data/api"; // ajustá el path real
import { toast } from "react-toastify";
import type { Coverage, InsuranceType } from "./companyEdit.types";
import { TIPO_LABEL } from "./companyEdit.types";

type Props = {
    cobertura: Coverage;
    onActualizada: () => void;
    onEliminada: () => void;
};

const CoverageRow = ({ cobertura, onActualizada, onEliminada }: Props) => {
    const [editando, setEditando] = useState(false);
    const [name, setName] = useState(cobertura.name);
    const [insuranceType, setInsuranceType] = useState<InsuranceType>(cobertura.insuranceType);
    const [guardando, setGuardando] = useState(false);
    const [eliminando, setEliminando] = useState(false);

    const abrirEdicion = () => {
        setName(cobertura.name);
        setInsuranceType(cobertura.insuranceType);
        setEditando(true);
    };

    const guardar = () => {
        if (!name.trim()) {
            toast.error("El nombre no puede estar vacío");
            return;
        }
        setGuardando(true);
        api.put(`/coberturas/${cobertura.id}`, { name, insuranceType })
            .then((response) => {
                toast.success(response.data?.message ?? "Cobertura actualizada correctamente");
                setEditando(false);
                onActualizada();
            })
            .catch((error) => {
                toast.error(error.response?.data?.message ?? "No se pudo actualizar la cobertura");
            })
            .finally(() => setGuardando(false));
    };

    const eliminar = () => {
        setEliminando(true);
        api.delete(`/coberturas/${cobertura.id}`)
            .then((response) => {
                toast.success(response.data?.message ?? "Cobertura eliminada correctamente");
                onEliminada();
            })
            .catch((error) => {
                toast.error(error.response?.data?.message ?? "No se pudo eliminar la cobertura");
            })
            .finally(() => setEliminando(false));
    };

    if (editando) {
        return (
            <div className="dashboard-widget-item">
                <div className="coverage-edit-row">
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="coverage-edit-input"
                    />
                    <select
                        value={insuranceType}
                        onChange={(e) => setInsuranceType(e.target.value as InsuranceType)}
                        className="coverage-edit-select"
                    >
                        {Object.entries(TIPO_LABEL).map(([key, label]) => (
                            <option key={key} value={key}>{label}</option>
                        ))}
                    </select>
                    <button type="button" className="twofa-copy-btn" onClick={guardar} disabled={guardando}>
                        <Check size={14} />
                    </button>
                    <button
                        type="button"
                        className="twofa-copy-btn"
                        onClick={() => setEditando(false)}
                        disabled={guardando}
                    >
                        <X size={14} />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-widget-item">
            <div className="dashboard-widget-item-main">
                <span className="dashboard-widget-item-title">{cobertura.name}</span>
                <span className="dashboard-widget-item-sub">{TIPO_LABEL[cobertura.insuranceType]}</span>
            </div>
            <div style={{ display: "flex", gap: "6px" }}>
                <button type="button" className="twofa-copy-btn" onClick={abrirEdicion}>
                    <Pencil size={14} />
                </button>
                <button type="button" className="twofa-copy-btn" onClick={eliminar} disabled={eliminando}>
                    <Trash2 size={14} />
                </button>
            </div>
        </div>
    );
};

export default CoverageRow;