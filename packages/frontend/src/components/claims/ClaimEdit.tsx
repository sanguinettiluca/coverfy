import { useState } from "react";
import { useForm } from "react-hook-form";
import api from "../../data/api";
import { toast } from "react-toastify";
import SearchClaimButton from "./SearchClaimButton";
import type { Claim, UpdateClaimForm } from "./claim.types";

const formatFecha = (fecha?: string | null) =>
    fecha ? new Date(fecha).toLocaleDateString("es-UY") : "-";

const ClaimEdit = () => {
    const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<UpdateClaimForm>();

    const [busquedaClaim, setBusquedaClaim] = useState("");
    const [resultados, setResultados] = useState<Claim[]>([]);
    const [claimCerrado, setClaimCerrado] = useState(false);
    const claimId = watch("claimId");

    const isDisabled = !claimId || claimCerrado;

    const handleEncontrados = (claims: Claim[]) => {
        setResultados(claims);
        if (claims.length === 1) {
            handleSeleccionar(claims[0]);
        } else {
            reset({ claimId: undefined, status: undefined, contactDate: "", notes: "" });
            setClaimCerrado(false);
        }
    };

    const handleNoEncontrados = () => {
        setResultados([]);
        reset({ claimId: undefined, status: undefined, contactDate: "", notes: "" });
        setClaimCerrado(false);
    };

    const handleSeleccionar = (claim: Claim) => {
        setClaimCerrado(claim.status === "CLOSED");
        reset({
            claimId: claim.id,
            status: claim.status,
            contactDate: claim.contactDate?.slice(0, 10),
            notes: claim.notes ?? "",
        });
    };

    const onSubmit = (data: UpdateClaimForm) => {
        if (!data.claimId) return;

        api.put(`/siniestros/${data.claimId}`, {
            status: data.status || undefined,
            contactDate: data.contactDate
                ? new Date(data.contactDate).toISOString()
                : undefined,
            notes: data.notes || undefined,
        })
            .then((response) => {
                toast.success(response.data.message);
                reset({
                    claimId: undefined,
                    status: undefined,
                    contactDate: "",
                    notes: "",
                });
                setClaimCerrado(false);
                setBusquedaClaim("");
                setResultados([]);
            })
            .catch((error) => {
                if (error.response) {
                    toast.error(error.response.data.message);
                } else {
                    console.error("Error de conexión:", error.message);
                }
            });
    };

    return (
        <div className="page">
            <div className="login-card">

                <h1 className="login-title">Editar Siniestro</h1>
                <p className="login-sub">Buscá por número de referencia o matrícula</p>

                <div className="login-form">
                    <label htmlFor="busquedaClaim">Número de referencia</label>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                        <input
                            id="busquedaClaim"
                            type="text"
                            placeholder="Número de referencia o matrícula"
                            value={busquedaClaim}
                            onChange={(e) => setBusquedaClaim(e.target.value)}
                        />
                        <SearchClaimButton
                            busqueda={busquedaClaim}
                            onEncontrados={handleEncontrados}
                            onNoEncontrados={handleNoEncontrados}
                        />
                    </div>
                </div>

                {resultados.length > 1 && (
                    <div className="login-form claim-edit-form">
                        <span className="claim-edit-select-label">
                            Se encontraron {resultados.length} siniestros — elegí cuál editar:
                        </span>
                        <div className="dashboard-widget-list">
                            {resultados.map((c) => (
                                <button
                                    type="button"
                                    key={c.id}
                                    className={`dashboard-widget-item claim-edit-option ${c.id === claimId ? "claim-edit-option--selected" : ""}`}
                                    onClick={() => handleSeleccionar(c)}
                                >
                                    <div className="dashboard-widget-item-main">
                                        <span className="dashboard-widget-item-title">
                                            {c.policy.policyNumber}
                                            {c.policy.referenceNumber ? ` · Ref. ${c.policy.referenceNumber}` : ""}
                                        </span>
                                        <span className="dashboard-widget-item-sub">
                                            {formatFecha(c.incidentDate)} — {c.status === "OPEN" ? "Abierto" : "Cerrado"}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {claimId && (
                    <form className="login-form claim-edit-form" autoComplete="on" onSubmit={handleSubmit(onSubmit)}>

                        <input type="hidden" {...register("claimId")} />

                        {claimCerrado && (
                            <span className="error claim-edit-closed-notice">
                                Este siniestro está cerrado y no se puede modificar
                            </span>
                        )}

                        <label htmlFor="status">Estado</label>
                        <select id="status" {...register("status")} disabled={claimCerrado}>
                            <option value="">Sin cambios</option>
                            <option value="OPEN">Abierto</option>
                            <option value="CLOSED">Cerrado</option>
                        </select>

                        <label htmlFor="contactDate">Fecha de Contacto</label>
                        <input id="contactDate" type="date" {...register("contactDate")} disabled={claimCerrado} />

                        <label htmlFor="notes">Notas</label>
                        <textarea
                            id="notes"
                            className="notas-textarea"
                            rows={4}
                            {...register("notes")}
                            disabled={claimCerrado}
                        />

                        <button type="submit" className="btn" disabled={isDisabled}>
                            Guardar cambios
                        </button>
                    </form>
                )}

            </div>
        </div>
    );
};

export default ClaimEdit;