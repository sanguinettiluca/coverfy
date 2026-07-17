import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router";
import SearchPolicyButton from "./SearchPoliciyButton";
import PolicyResult from "./PolicyResult";
import api from "../../data/api";

type TipoSeguro =
    | "VEHICULO"
    | "VIAJE"
    | "ALQUILER"
    | "HOGAR"
    | "COMERCIO"
    | "RESPONSABILIDAD_CIVIL"
    | "FIANZA"
    | "VIDA"
    | "OTROS";

type EstadoPoliza = "ACTIVA" | "VENCIDA" | "CANCELADA" | "PENDIENTE" | "SUSPENDIDA";
type MetodoPago = "Efectivo" | "Credito" | "Transferencia" | "Debito";

type BuscarPolizaForm = {
    numeroReferencia: string;
};

type Cobertura = {
    id: string;
    nombre: string;
    companiaId: string;
    tipoSeguro: TipoSeguro;
};

type Compania = {
    id: string;
    nombre: string;
    porcentajeComision: number;
    brokerId: string;
    createdAt: string;
    coberturas: Cobertura[];
};

type PolizaDetalle = {
    id: string;
    numeroPoliza: string;
    numeroReferencia?: string | null;
    tipoSeguro: TipoSeguro;
    estado?: EstadoPoliza | null;
    fechaInicio?: string | null;
    fechaVencimiento?: string | null;
    montoTotal?: number | null;
    cuotas?: number | null;
    metodoPago?: MetodoPago | null;
    companiaId: string;
    coberturaId?: string | null;
    broker?: { id: string; nombre: string; role: string } | null;
    cliente?: { id: string; nombres: string; apellidos: string } | null;
    detalleResponsabilidadCivil?: { actividad: string; limiteCobertura: number } | null;
    detalleFianza?: { tipoFianza: string; montoGarantizado?: number | null; beneficiario: string } | null;
    detalleVida?: { sumaAsegurada?: number | null; beneficiario: string } | null;
    detalleOtros?: { descripcion: string } | null;
    detalleAlquiler?: { direccion: string; tipoInmueble: string; valorAlquiler: number; deposito: number } | null;
    detalleComercio?: { razonSocial: string; rubro: string; direccion: string } | null;
    detalleHogar?: { direccion: string; tipoConstruccion: string; metrosCuadrados?: number | null; valorPropiedad: number } | null;
    detalleVehiculo?: { marca: string; modelo: string; anio: number; matricula: string; padron: string; chasis: string; motor: string } | null;
    detalleViaje?: { destino: string; fechaSalida: string; fechaRegreso: string; pasajeros: number } | null;
};

const PoliciesSearch = () => {
    const { register, watch, formState: { errors } } = useForm<BuscarPolizaForm>();

    const numeroReferencia = watch("numeroReferencia");

    const [poliza, setPoliza] = useState<PolizaDetalle | null>(null);
    const [compania, setCompania] = useState<Compania | null>(null);
    const [buscado, setBuscado] = useState(false);
    const [cargandoDetalle, setCargandoDetalle] = useState(false);

    const handleEncontrado = async (polizaId: string) => {
        setCargandoDetalle(true);
        try {
            const detalle = await api.get(`/polizas/${polizaId}`);
            const polizaData: PolizaDetalle = detalle.data;
            setPoliza(polizaData);

            if (polizaData.companiaId) {
                try {
                    const companiaResponse = await api.get(`/companias/${polizaData.companiaId}`);
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
                            />
                        </div>
                        {errors.numeroReferencia && <span className="error">Este campo es requerido</span>}
                    </div>

                    <p className="small">
                        <Link to="/polizas">Volver</Link>
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