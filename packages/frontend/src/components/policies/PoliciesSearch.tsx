import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useSearchParams } from "react-router";
import SearchPolicyButton from "./SearchPoliciyButton";
import PolicyResult from "./PolicyResult";
import api from "../../data/api";

type InsuranceType =
    | "VEHICLE"
    | "TRIP"
    | "RENTAL"
    | "HOME"
    | "BUSINESS"
    | "LIABILITY"
    | "BOND"
    | "LIFE"
    | "OTHER";

type PolicyStatus = "ACTIVE" | "EXPIRED" | "CANCELLED" | "SUSPENDED";
type PaymentMethod = "Cash" | "Credit" | "Transfer" | "Debit";

type BuscarPolizaForm = {
    numeroReferencia: string;
};

type Coverage = {
    id: string;
    name: string;
    companyId: string;
    insuranceType: InsuranceType;
};

type Company = {
    id: string;
    name: string;
    commissionRate: number;
    brokerId: string;
    createdAt: string;
    coverages: Coverage[];
};

type Policy = {
    id: string;
    policyNumber: string;
    referenceNumber?: string | null;
    insuranceType: InsuranceType;
    status?: PolicyStatus | null;
    startDate?: string | null;
    expirationDate?: string | null;
    totalAmount?: number | null;
    installments?: number | null;
    paymentMethod?: PaymentMethod | null;
    companyId: string;
    coverageId?: string | null;
    broker?: { id: string; name: string; role: string } | null;
    client?: { id: string; firstName: string; lastName: string } | null;
    liabilityDetails?: { activity: string; coverageLimit: number } | null;
    bondDetails?: { bondType: string; guaranteedAmount?: number | null; beneficiary: string } | null;
    lifeDetails?: { insuredAmount?: number | null; beneficiary: string } | null;
    otherDetails?: { description: string } | null;
    rentalDetails?: { address: string; propertyType: string; rentAmount: number } | null;
    businessDetails?: { businessName: string; industry: string; address: string } | null;
    homeDetails?: { address: string; constructionType: string; squareMeters?: number | null; propertyValue: number } | null;
    vehicleDetails?: { brand: string; model: string; year: number; licensePlate: string; registrationNumber: string; chassisNumber: string; engineNumber: string } | null;
    tripDetails?: { destination: string; departureDate: string; returnDate: string; passengers: number } | null;
};

const PoliciesSearch = () => {
    const { register, watch, setValue, formState: { errors } } = useForm<BuscarPolizaForm>();

    const [searchParams] = useSearchParams();
    const numeroReferencia = watch("numeroReferencia");

    const [poliza, setPoliza] = useState<Policy | null>(null);
    const [compania, setCompania] = useState<Company | null>(null);
    const [buscado, setBuscado] = useState(false);
    const [cargandoDetalle, setCargandoDetalle] = useState(false);
    const [autoTrigger, setAutoTrigger] = useState(0);

    // Si llegamos con ?referencia=X en la URL, precargamos el campo y
    // disparamos la búsqueda automáticamente una sola vez al montar.
    useEffect(() => {
        const referenciaUrl = searchParams.get("referencia");
        if (referenciaUrl) {
            setValue("numeroReferencia", referenciaUrl);
            setAutoTrigger((prev) => prev + 1);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleEncontrado = async (polizaId: string) => {
        setCargandoDetalle(true);
        try {
            const detalle = await api.get(`/polizas/${polizaId}`);
            const polizaData: Policy = detalle.data;
            setPoliza(polizaData);

            if (polizaData.companyId) {
                try {
                    const companiaResponse = await api.get(`/companias/${polizaData.companyId}`);
                    setCompania(companiaResponse.data);
                } catch {
                    setCompania(null);
                }
            } else {
                setCompania(null);
            }

            setBuscado(true);
        } catch {
            setPoliza(null);
            setCompania(null);
            setBuscado(true);
        } finally {
            setCargandoDetalle(false);
        }
    };

    return (
        <div className="page">
            <div className="search-layout">

                <div className="login-card">
                    <h1 className="login-title">Buscar Póliza</h1>
                    <p className="login-sub">Ingresa el número de referencia de la póliza</p>

                    <div className="login-form">
                        <label htmlFor="numeroReferencia">Número de referencia</label>
                        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                            <input
                                id="numeroReferencia"
                                type="text"
                                placeholder="Número de referencia"
                                {...register("numeroReferencia", { required: true })}
                            />
                            <SearchPolicyButton
                                numeroReferencia={numeroReferencia ?? ""}
                                onEncontrado={handleEncontrado}
                                onNoEncontrado={() => {
                                    setPoliza(null);
                                    setCompania(null);
                                    setBuscado(true);
                                }}
                                autoTrigger={autoTrigger}
                            />
                        </div>
                        {errors.numeroReferencia && <span className="error">Este campo es requerido</span>}
                    </div>

                    <p className="small">
                        <Link to="/">Volver al Dashboard</Link>
                    </p>
                </div>

                {(cargandoDetalle || buscado) && (
                    <div className="result-card">
                        {cargandoDetalle && <p className="login-sub">Cargando datos de la póliza...</p>}
                        {!cargandoDetalle && buscado && !poliza && (
                            <p className="login-sub">No se encontró la póliza</p>
                        )}
                        {!cargandoDetalle && poliza && <PolicyResult
                            poliza={poliza}
                            compania={compania}
                            onEliminada={() => {
                                setPoliza(null);
                                setCompania(null);
                                setBuscado(false);
                            }}
                        />}
                    </div>
                )}

            </div>
        </div>
    );
};

export default PoliciesSearch;