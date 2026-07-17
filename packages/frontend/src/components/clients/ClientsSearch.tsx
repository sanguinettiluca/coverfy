import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import SearchClientButton from "./SearchClientButton";
import ClientResult from "./ClientResult";
import api from "../../data/api";

type BuscarClienteForm = {
    documento: string;
};

type Cliente = {
    id: string;
    nombres: string;
    apellidos: string;
    documento: string;
    fechaNacimiento?: string;
    celular: string;
    celularAlternativo?: string;
    email: string;
    direccion: string;
    notas?: string;
};

type Poliza = {
    id: string;
    numeroPoliza: string;
    numeroReferencia?: string | null;
    tipoSeguro: string;
    estado?: string | null;
    fechaInicio?: string | null;
    fechaVencimiento?: string | null;
    montoTotal?: number | null;
    cuotas?: number | null;
    metodoPago?: string | null;
    clienteId: string;
    companiaId: string;
    coberturaId?: string | null;
    brokerId: string;
    createdAt: string;
    updatedAt: string;
};

type ClienteCompleto = {
    id: string;
    nombres: string;
    apellidos: string;
    documento: string;
    fechaNacimiento?: string | null;
    celular: string;
    celularAlternativo?: string | null;
    email: string;
    direccion: string;
    notas?: string | null;
    creadoPorId: string;
    brokerId: string;
    createdAt: string;
    creadoPor?: { id: string; nombre: string; role: string };
    polizas: Poliza[];
};

const ClientsSearch = () => {
    const { register, watch, reset, formState: { errors } } = useForm<BuscarClienteForm>();

    const navigate = useNavigate();
    const documento = watch("documento");

    const [cliente, setCliente] = useState<ClienteCompleto | null>(null);
    const [buscado, setBuscado] = useState(false);
    const [cargandoDetalle, setCargandoDetalle] = useState(false);

    const handleEncontrado = async (clienteEncontrado: Cliente) => {
        setCargandoDetalle(true);
        try {
            const detalle = await api.get(`/clientes/${clienteEncontrado.id}`);
            setCliente(detalle.data);
            setBuscado(true);
        } catch {
            setCliente(null);
            setBuscado(true);
        } finally {
            setCargandoDetalle(false);
        }
    };

    const handleVolver = () => {
        reset({
            documento: ""
        });

        setCliente(null);
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
                                    setCliente(null);
                                    setBuscado(true);
                                }}
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

                {(cargandoDetalle || (buscado && (cliente || !cargandoDetalle))) && (
                    <div className="result-card">
                        {cargandoDetalle && <p className="login-sub">Cargando datos del cliente...</p>}

                        {!cargandoDetalle && buscado && !cliente && (
                            <p className="login-sub">No se encontró ningún cliente con ese documento</p>
                        )}

                        {!cargandoDetalle && cliente && (
                            <ClientResult
                                cliente={cliente}
                                onEliminado={() => {
                                    setCliente(null);
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