import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router";
import SearchClientButton from "./SearchClientButton";
import ClientResult from "./ClientResult";
import api from "../../data/api";

type BuscarClienteForm = {
    documento: string;
};

type Cliente = {
    id: string;
    firstName: string;
    lastName: string;
    documentNumber: string;
    birthDate?: string;
    phone: string;
    alternativePhone?: string;
    email: string;
    address: string;
    notes?: string;
};

type Policy = {
    id: string;
    policyNumber: string;
    referenceNumber?: string | null;
    insuranceType: string;
    status?: string | null;
    startDate?: string | null;
    expirationDate?: string | null;
    totalAmount?: number | null;
    installments?: number | null;
    paymentMethod?: string | null;
    clientId: string;
    companyId: string;
    coverageId?: string | null;
    brokerId: string;
    createdAt: string;
    updatedAt: string;
};

type ClientComplete = {
    id: string;
    firstName: string;
    lastName: string;
    documentNumber: string;
    dateOfBirth?: string | null;
    phone: string;
    alternativePhone?: string | null;
    email: string;
    address: string;
    notes?: string | null;
    createdById: string;
    brokerId: string;
    createdAt: string;
    createdBy?: { id: string; name: string; role: string };
    policies: Policy[];
};

const ClientsSearch = () => {
    const { register, watch, reset, setValue, formState: { errors } } = useForm<BuscarClienteForm>();

    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const documento = watch("documento");

    const [client, setClient] = useState<ClientComplete | null>(null);
    const [buscado, setBuscado] = useState(false);
    const [cargandoDetalle, setCargandoDetalle] = useState(false);
    const [autoTrigger, setAutoTrigger] = useState(0);

    // Si llegamos con ?documento=X en la URL, precargamos el campo y
    // disparamos la búsqueda automáticamente una sola vez al montar.
    useEffect(() => {
        const documentoUrl = searchParams.get("documento");
        if (documentoUrl) {
            setValue("documento", documentoUrl);
            setAutoTrigger((prev) => prev + 1);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleEncontrado = async (clientFound: Cliente) => {
        setCargandoDetalle(true);
        try {
            const detalle = await api.get(`/clientes/${clientFound.id}`);
            setClient(detalle.data);
            setBuscado(true);
        } catch {
            setClient(null);
            setBuscado(true);
        } finally {
            setCargandoDetalle(false);
        }
    };

    const handleVolver = () => {
        reset({
            documento: ""
        });

        setClient(null);
        setBuscado(false);
        setCargandoDetalle(false);

        navigate("/clients/search");
    };

    return (
        <div className="page">
            <div className="search-layout">

                <div className="login-card">
                    <h1 className="login-title">Buscar Cliente</h1>
                    <p className="login-sub">Ingresa el documento del cliente</p>

                    <div className="login-form">

                        <label htmlFor="documento">Documento</label>
                        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                            <input
                                id="documento"
                                type="text"
                                placeholder="Cédula o documento de identidad"
                                {...register("documento", { required: true })}
                            />
                            <SearchClientButton
                                documento={documento ?? ""}
                                onEncontrado={handleEncontrado}
                                onNoEncontrado={() => {
                                    setClient(null);
                                    setBuscado(true);
                                }}
                                autoTrigger={autoTrigger}
                            />
                        </div>
                        {errors.documento && <span className="error">Este campo es requerido</span>}

                    </div>

                    <p className="small">
                        <button type="button" onClick={handleVolver} className="small">
                            Volver
                        </button>
                    </p>
                </div>

                {(cargandoDetalle || (buscado && (client || !cargandoDetalle))) && (
                    <div className="result-card">
                        {cargandoDetalle && <p className="login-sub">Cargando datos del cliente...</p>}

                        {!cargandoDetalle && buscado && !client && (
                            <p className="login-sub">No se encontró ningún cliente con ese documento</p>
                        )}

                        {!cargandoDetalle && client && (
                            <ClientResult
                                cliente={client}
                                onEliminado={() => {
                                    setClient(null);
                                    setBuscado(false);
                                }}
                            />
                        )}
                    </div>
                )}

            </div>
        </div>
    );
};

export default ClientsSearch;