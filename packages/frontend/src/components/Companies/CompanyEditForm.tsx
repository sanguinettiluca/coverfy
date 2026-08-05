import { useState } from "react";
import type { UseFormRegister, UseFormHandleSubmit, FieldErrors } from "react-hook-form";
import { Trash2 } from "lucide-react";
import api from "../../data/api"; // ajustá el path real
import { toast } from "react-toastify";
import type { CompanyForm, Company } from "./companyEdit.types";

type Props = {
    register: UseFormRegister<CompanyForm>;
    handleSubmit: UseFormHandleSubmit<CompanyForm>;
    errors: FieldErrors<CompanyForm>;
    company: Company;
    onGuardado: () => void;
    onEliminada: () => void;
};

const CompanyEditForm = ({ register, handleSubmit, errors, company, onGuardado, onEliminada }: Props) => {
    const [mostrarModal, setMostrarModal] = useState(false);
    const [eliminando, setEliminando] = useState(false);

    const onSubmit = (data: CompanyForm) => {
        api.put(`/companias/${data.companyId}`, {
            name: data.name,
            commissionRate: data.commissionRate ?? undefined,
            url: data.url || undefined,
        })
            .then((response) => {
                toast.success(response.data?.message ?? "Compañía actualizada correctamente");
                onGuardado();
            })
            .catch((error) => {
                toast.error(error.response?.data?.message ?? "No se pudo actualizar la compañía");
            });
    };

    const handleEliminar = () => {
        setEliminando(true);
        api.delete(`/companias/${company.id}`)
            .then((response) => {
                toast.success(response.data?.message ?? "Compañía eliminada correctamente");
                setMostrarModal(false);
                onEliminada();
            })
            .catch((error) => {
                toast.error(error.response?.data?.message ?? "No se pudo eliminar la compañía");
            })
            .finally(() => setEliminando(false));
    };

    return (
        <>
            <form className="login-form claim-edit-form" autoComplete="on" onSubmit={handleSubmit(onSubmit)}>

                <input type="hidden" {...register("companyId")} />

                <label htmlFor="name">Nombre</label>
                <input
                    id="name"
                    type="text"
                    {...register("name", { required: true })}
                />
                {errors.name && <span className="error">Este campo es requerido</span>}

                <label htmlFor="commissionRate">Porcentaje de Comisión</label>
                <input
                    id="commissionRate"
                    type="number"
                    step="0.01"
                    placeholder="Opcional"
                    {...register("commissionRate", {
                        valueAsNumber: true,
                        min: { value: 0, message: "Debe ser mayor o igual a 0" },
                        max: { value: 100, message: "No puede ser mayor a 100" },
                    })}
                />
                {errors.commissionRate && (
                    <span className="error">{errors.commissionRate.message}</span>
                )}

                <label htmlFor="url">Sitio web</label>
                <input
                    id="url"
                    type="url"
                    placeholder="https://www.aseguradora.com"
                    {...register("url", {
                        pattern: {
                            value: /^https?:\/\/.+/i,
                            message: "Debe ser una URL válida, comenzando con http:// o https://",
                        },
                    })}
                />
                {errors.url && <span className="error">{errors.url.message}</span>}

                <button type="submit" className="btn">
                    Guardar cambios
                </button>

                <button
                    type="button"
                    className="delete-policy-btn"
                    onClick={() => setMostrarModal(true)}
                    style={{ marginTop: "0.5rem" }}
                >
                    <Trash2 size={14} />
                    Eliminar compañía
                </button>
            </form>

            {mostrarModal && (
                <div className="confirm-modal-overlay" onClick={() => !eliminando && setMostrarModal(false)}>
                    <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="confirm-modal-title">¿Eliminar compañía?</div>
                        <p className="confirm-modal-text">
                            Esta acción eliminará <strong>{company.name}</strong> de forma
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
                                onClick={handleEliminar}
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

export default CompanyEditForm;