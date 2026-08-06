import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router";
import SearchClaimButton from "./SearchClaimButton";
import ClaimResult from "./ClaimResult";
import type { Claim } from "./claim.types";

type SearchClaimForm = {
    query: string;
};

const ClaimsSearch = () => {
    const { register, watch, formState: { errors } } = useForm<SearchClaimForm>();

    const query = watch("query");

    const [claims, setClaims] = useState<Claim[]>([]);
    const [searched, setSearched] = useState(false);

    const removeFromList = (id: string) => {
        setClaims((prev) => prev.filter((c) => c.id !== id));
    };

    return (
        <div className="page">
            <div className="search-layout">

                <div className="login-card">
                    <h1 className="login-title">Buscar Siniestros</h1>
                    <p className="login-sub">Buscá por número de póliza</p>

                    <div className="login-form">
                        <label htmlFor="query">Número de póliza</label>
                        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                            <input
                                id="query"
                                type="text"
                                placeholder="Número de póliza"
                                {...register("query", { required: true })}
                            />
                            <SearchClaimButton
                                query={query ?? ""}
                                onFound={(found) => {
                                    setClaims(found);
                                    setSearched(true);
                                }}
                                onNotFound={() => {
                                    setClaims([]);
                                    setSearched(true);
                                }}
                            />
                        </div>
                        {errors.query && <span className="error">Este campo es requerido</span>}
                    </div>

                    <p className="small">
                        <Link to="/claims/new">Registrar nuevo siniestro</Link>
                    </p>
                </div>

                {searched && (
                    <div className="result-card">
                        {claims.length === 0 && (
                            <p className="login-sub">No se encontraron siniestros</p>
                        )}

                        {claims.length > 0 && (
                            <>
                                <p className="dashboard-widget-item-sub" style={{ marginBottom: "1rem" }}>
                                    {claims.length} {claims.length === 1 ? "siniestro encontrado" : "siniestros encontrados"}
                                </p>

                                {claims.map((claim, index) => (
                                    <div
                                        key={claim.id}
                                        style={index > 0 ? { marginTop: "2rem", paddingTop: "2rem", borderTop: "0.5px solid var(--color-border-soft)" } : undefined}
                                    >
                                        <ClaimResult
                                            claim={claim}
                                            onEliminado={() => removeFromList(claim.id)}
                                        />
                                    </div>
                                ))}
                            </>
                        )}
                    </div>
                )}

            </div>
        </div>
    );
};

export default ClaimsSearch;