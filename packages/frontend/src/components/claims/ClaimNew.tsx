import { useState } from "react";
import { useForm } from "react-hook-form";
import api from "../../data/api";
import { toast } from "react-toastify";
import SearchVehiclePolicyButton from "./SearchVehiclePolicyButton";
import type { CreateClaimForm, ClaimPolicySummary } from "./claim.types";

const ClaimNew = () => {
    const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<CreateClaimForm>();

    const [busquedaReferencia, setBusquedaReferencia] = useState("");
    const [policyEncontrada, setPolicyEncontrada] = useState<ClaimPolicySummary | null>(null);

    const incidentDate = watch("incidentDate");

    const isDisabled = !policyEncontrada || !incidentDate;

    const handlePolicyEncontrada = (policy: ClaimPolicySummary) => {
        setPolicyEncontrada(policy);
        setValue("policyId", policy.id, { shouldValidate: true });
    };

    const handlePolicyNoEncontrada = () => {
        setPolicyEncontrada(null);
        setValue("policyId", "");
    };

    const onSubmit = (data: CreateClaimForm) => {
        api.post("/siniestros", {
            policyId: data.policyId,
            incidentDate: data.incidentDate
                ? new Date(data.incidentDate).toISOString()
                : undefined,
            contactDate: data.contactDate
                ? new Date(data.contactDate).toISOString()
                : undefined,
            notes: data.notes || undefined,
        })
            .then((response) => {
                toast.success(response.data.message);
                reset();
                setPolicyEncontrada(null);
                setBusquedaReferencia("");
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

                <h1 className="login-title">Registrar Siniestro</h1>
                <p className="login-sub">Solo disponible para pólizas de vehículo activas</p>

                <form className="login-form" autoComplete="on" onSubmit={handleSubmit(onSubmit)}>

                    <input type="hidden" {...register("policyId", { required: true })} />

                    <label htmlFor="busquedaReferencia">Número de referencia</label>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                        <input
                            id="busquedaReferencia"
                            type="text"
                            placeholder="Número de referencia"
                            value={busquedaReferencia}
                            onChange={(e) => {
                                setBusquedaReferencia(e.target.value);
                                if (policyEncontrada) handlePolicyNoEncontrada();
                            }}
                        />
                        <SearchVehiclePolicyButton
                            referencia={busquedaReferencia}
                            onEncontrado={handlePolicyEncontrada}
                            onNoEncontrado={handlePolicyNoEncontrada}
                        />
                    </div>
                    {errors.policyId && <span className="error">Debe buscar y seleccionar una póliza</span>}

                    {policyEncontrada && (
                        <p className="login-sub" style={{ marginTop: "-4px" }}>
                            {policyEncontrada.policyNumber} — {policyEncontrada.vehicleDetails?.brand}{" "}
                            {policyEncontrada.vehicleDetails?.model} ({policyEncontrada.vehicleDetails?.licensePlate})
                            {" · "}
                            {policyEncontrada.client
                                ? `${policyEncontrada.client.firstName} ${policyEncontrada.client.lastName}`
                                : ""}
                        </p>
                    )}

                    <label htmlFor="incidentDate">Fecha del siniestro</label>
                    <input
                        id="incidentDate"
                        type="date"
                        {...register("incidentDate", { required: true })}
                    />
                    {errors.incidentDate && <span className="error">Este campo es requerido</span>}

                    <label htmlFor="contactDate">Fecha de contacto</label>
                    <input
                        id="contactDate"
                        type="date"
                        placeholder="Opcional"
                        {...register("contactDate")}
                    />

                    <label htmlFor="notes">Notas</label>
                    <textarea
                        id="notes"
                        className="notas-textarea"
                        placeholder="Detalles del siniestro..."
                        rows={4}
                        {...register("notes")}
                    />

                    <button type="submit" className="btn" disabled={isDisabled}>
                        Registrar siniestro
                    </button>
                </form>

            </div>
        </div>
    );
};

export default ClaimNew;