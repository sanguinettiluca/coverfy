import { useState } from "react";
import { useForm } from "react-hook-form";
import api from "../../data/api";
import { toast } from "react-toastify";
import SearchClaimButton from "./SearchClaimButton";
import type { Claim, UpdateClaimForm } from "./claim.types";

const formatDate = (date?: string | null) =>
    date ? new Date(date).toLocaleDateString("es-UY") : "-";

const ClaimEdit = () => {
    const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<UpdateClaimForm>();

    const [searchQuery, setSearchQuery] = useState("");
    const [results, setResults] = useState<Claim[]>([]);
    const [claimClosed, setClaimClosed] = useState(false);
    const claimId = watch("claimId");

    const isDisabled = !claimId || claimClosed;

    const handleFound = (claims: Claim[]) => {
        setResults(claims);
        if (claims.length === 1) {
            handleSelect(claims[0]);
        } else {
            reset({ claimId: undefined, status: undefined, contactDate: "", notes: "" });
            setClaimClosed(false);
        }
    };

    const handleNotFound = () => {
        setResults([]);
        reset({ claimId: undefined, status: undefined, contactDate: "", notes: "" });
        setClaimClosed(false);
    };

    const handleSelect = (claim: Claim) => {
        setClaimClosed(claim.status === "CLOSED");
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
                setClaimClosed(false);
                setSearchQuery("");
                setResults([]);
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
                <p className="login-sub">Buscá por número de póliza</p>

                <div className="login-form">
                    <label htmlFor="searchQuery">Número de póliza</label>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                        <input
                            id="searchQuery"
                            type="text"
                            placeholder="Número de póliza"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <SearchClaimButton
                            query={searchQuery}
                            onFound={handleFound}
                            onNotFound={handleNotFound}
                        />
                    </div>
                </div>

                {results.length > 1 && (
                    <div className="login-form claim-edit-form">
                        <span className="claim-edit-select-label">
                            Se encontraron {results.length} siniestros — elegí cuál editar:
                        </span>
                        <div className="dashboard-widget-list">
                            {results.map((c) => (
                                <button
                                    type="button"
                                    key={c.id}
                                    className={`dashboard-widget-item claim-edit-option ${c.id === claimId ? "claim-edit-option--selected" : ""}`}
                                    onClick={() => handleSelect(c)}
                                >
                                    <div className="dashboard-widget-item-main">
                                        <span className="dashboard-widget-item-title">
                                            {c.policy.policyNumber}
                                        </span>
                                        <span className="dashboard-widget-item-sub">
                                            {formatDate(c.incidentDate)} — {c.status === "OPEN" ? "Abierto" : "Cerrado"}
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

                        {claimClosed && (
                            <span className="error claim-edit-closed-notice">
                                Este siniestro está cerrado y no se puede modificar
                            </span>
                        )}

                        <label htmlFor="status">Estado</label>
                        <select id="status" {...register("status")} disabled={claimClosed}>
                            <option value="">Sin cambios</option>
                            <option value="OPEN">Abierto</option>
                            <option value="CLOSED">Cerrado</option>
                        </select>

                        <label htmlFor="contactDate">Fecha de Contacto</label>
                        <input id="contactDate" type="date" {...register("contactDate")} disabled={claimClosed} />

                        <label htmlFor="notes">Notas</label>
                        <textarea
                            id="notes"
                            className="notas-textarea"
                            rows={4}
                            {...register("notes")}
                            disabled={claimClosed}
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