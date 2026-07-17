import { useForm } from "react-hook-form";
import api from "../../../data/api";
import SearchPolicyButton from "../SearchPoliciyButton";
import { toast } from "react-toastify";
import PolicyDetailFields from "./PolicyDetailField";
import type { PolizaEditForm, PolizaDetalle } from "./policiesEdit.types";

const PoliciesEdit = () => {
    const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<PolizaEditForm>();

    const tipoSeguro = watch("tipoSeguro");
    const numeroReferencia = watch("numeroReferencia");
    const polizaId = watch("polizaId");
    const fechaInicio = watch("fechaInicio");
    const fechaVencimiento = watch("fechaVencimiento");

    const fechasInvalidas =
        !!fechaInicio && !!fechaVencimiento && fechaVencimiento < fechaInicio;

    const isDisabled = !polizaId || fechasInvalidas;

    const handleEncontrado = async (polizaEncontradaId: string) => {
        try {
            const detalle = await api.get(`/polizas/${polizaEncontradaId}`);
            const poliza: PolizaDetalle = detalle.data;

            reset({
                polizaId: poliza.id,
                numeroReferencia: poliza.numeroReferencia ?? "",
                tipoSeguro: poliza.tipoSeguro,
                estado: poliza.estado ?? undefined,
                fechaInicio: poliza.fechaInicio?.slice(0, 10),
                fechaVencimiento: poliza.fechaVencimiento?.slice(0, 10),
                montoTotal: poliza.montoTotal ?? undefined,
                cuotas: poliza.cuotas ?? undefined,
                metodoPago: poliza.metodoPago ?? undefined,

                detalleResponsabilidadCivil: poliza.detalleResponsabilidadCivil
                    ? {
                        actividad: poliza.detalleResponsabilidadCivil.actividad,
                        limiteCobertura: poliza.detalleResponsabilidadCivil.limiteCobertura,
                    }
                    : undefined,

                detalleFianza: poliza.detalleFianza
                    ? {
                        tipoFianza: poliza.detalleFianza.tipoFianza,
                        montoGarantizado: poliza.detalleFianza.montoGarantizado ?? undefined,
                        beneficiario: poliza.detalleFianza.beneficiario,
                    }
                    : undefined,

                detalleVida: poliza.detalleVida
                    ? {
                        sumaAsegurada: poliza.detalleVida.sumaAsegurada ?? undefined,
                        beneficiario: poliza.detalleVida.beneficiario,
                    }
                    : undefined,

                detalleOtros: poliza.detalleOtros
                    ? { descripcion: poliza.detalleOtros.descripcion }
                    : undefined,

                detalleAlquiler: poliza.detalleAlquiler
                    ? {
                        direccion: poliza.detalleAlquiler.direccion,
                        tipoInmueble: poliza.detalleAlquiler.tipoInmueble,
                        valorAlquiler: poliza.detalleAlquiler.valorAlquiler,
                        deposito: poliza.detalleAlquiler.deposito,
                    }
                    : undefined,

                detalleComercio: poliza.detalleComercio
                    ? {
                        razonSocial: poliza.detalleComercio.razonSocial,
                        rubro: poliza.detalleComercio.rubro,
                        direccion: poliza.detalleComercio.direccion,
                    }
                    : undefined,

                detalleHogar: poliza.detalleHogar
                    ? {
                        direccion: poliza.detalleHogar.direccion,
                        tipoConstruccion: poliza.detalleHogar.tipoConstruccion,
                        metrosCuadrados: poliza.detalleHogar.metrosCuadrados ?? undefined,
                        valorPropiedad: poliza.detalleHogar.valorPropiedad,
                    }
                    : undefined,

                detalleVehiculo: poliza.detalleVehiculo
                    ? {
                        marca: poliza.detalleVehiculo.marca,
                        modelo: poliza.detalleVehiculo.modelo,
                        anio: poliza.detalleVehiculo.anio,
                        matricula: poliza.detalleVehiculo.matricula,
                        padron: poliza.detalleVehiculo.padron,
                        chasis: poliza.detalleVehiculo.chasis,
                        motor: poliza.detalleVehiculo.motor,
                    }
                    : undefined,

                detalleViaje: poliza.detalleViaje
                    ? {
                        destino: poliza.detalleViaje.destino,
                        fechaSalida: poliza.detalleViaje.fechaSalida?.slice(0, 10),
                        fechaRegreso: poliza.detalleViaje.fechaRegreso?.slice(0, 10),
                        pasajeros: poliza.detalleViaje.pasajeros,
                    }
                    : undefined,
            });
        } catch {

        }
    };

    const handleNoEncontrado = () => {
        reset({ numeroReferencia, polizaId: undefined, tipoSeguro: "" });
    };

    const onSubmit = (data: PolizaEditForm) => {
        if (!data.polizaId) {
            toast.error("No se encontró la póliza a editar");
            return;
        }

        api.put(`/polizas/${data.polizaId}`, {
            estado: data.estado ? data.estado.toUpperCase() : undefined,

            fechaInicio: data.fechaInicio
                ? new Date(data.fechaInicio).toISOString()
                : undefined,

            fechaVencimiento: data.fechaVencimiento
                ? new Date(data.fechaVencimiento).toISOString()
                : undefined,

            montoTotal: data.montoTotal || undefined,
            cuotas: data.cuotas || undefined,
            metodoPago: data.metodoPago || undefined,

            detalleResponsabilidadCivil: data.detalleResponsabilidadCivil,
            detalleFianza: data.detalleFianza,
            detalleVida: data.detalleVida,
            detalleOtros: data.detalleOtros,
            detalleAlquiler: data.detalleAlquiler,
            detalleComercio: data.detalleComercio,
            detalleHogar: data.detalleHogar,
            detalleVehiculo: data.detalleVehiculo,
            detalleViaje: data.detalleViaje
        })
            .then(() => {
                toast.success("Póliza actualizada correctamente");
                reset({
                    polizaId: "",
                    numeroReferencia: "",
                    tipoSeguro: "",
                    estado: undefined,
                    fechaInicio: "",
                    fechaVencimiento: "",
                    montoTotal: undefined,
                    cuotas: undefined,
                    metodoPago: undefined,

                    detalleResponsabilidadCivil: {
                        actividad: "",
                        limiteCobertura: undefined
                    },

                    detalleFianza: {
                        tipoFianza: "",
                        montoGarantizado: undefined,
                        beneficiario: ""
                    },

                    detalleVida: {
                        sumaAsegurada: undefined,
                        beneficiario: ""
                    },

                    detalleOtros: {
                        descripcion: ""
                    },

                    detalleAlquiler: {
                        direccion: "",
                        tipoInmueble: "",
                        valorAlquiler: undefined,
                        deposito: undefined
                    },

                    detalleComercio: {
                        razonSocial: "",
                        rubro: "",
                        direccion: ""
                    },

                    detalleHogar: {
                        direccion: "",
                        tipoConstruccion: "",
                        metrosCuadrados: undefined,
                        valorPropiedad: undefined
                    },

                    detalleVehiculo: {
                        marca: "",
                        modelo: "",
                        anio: undefined,
                        matricula: "",
                        padron: "",
                        chasis: "",
                        motor: ""
                    },

                    detalleViaje: {
                        destino: "",
                        fechaSalida: "",
                        fechaRegreso: "",
                        pasajeros: undefined
                    }
                });
            })
            .catch(() => {
                toast.error("Error al actualizar póliza");
            });
    };

    return (
        <div className="page">
            <div className="login-card">

                <h1 className="login-title">Editar Póliza</h1>
                <p className="login-sub">Completa los detalles debajo</p>

                <form className="login-form" autoComplete="on" onSubmit={handleSubmit(onSubmit)}>

                    <input type="hidden" {...register("polizaId")} />

                    <label htmlFor="numeroReferencia">Número de Referencia</label>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                        <input
                            id="numeroReferencia"
                            type="text"
                            {...register("numeroReferencia", { required: true })}
                        />
                        <SearchPolicyButton
                            numeroReferencia={numeroReferencia ?? ""}
                            onEncontrado={handleEncontrado}
                            onNoEncontrado={handleNoEncontrado}
                        />
                    </div>
                    {errors.numeroReferencia && <span className="error">Este campo es requerido</span>}

                    <label htmlFor="tipoSeguro">Tipo de Seguro</label>
                    <select id="tipoSeguro" {...register("tipoSeguro")} disabled>
                        <option value="">Elije un tipo de seguro...</option>
                        <option value="VEHICULO">Vehículo</option>
                        <option value="VIAJE">Viaje</option>
                        <option value="ALQUILER">Alquiler</option>
                        <option value="HOGAR">Hogar</option>
                        <option value="COMERCIO">Comercio</option>
                        <option value="RESPONSABILIDAD_CIVIL">Responsabilidad Civil</option>
                        <option value="FIANZA">Fianza</option>
                        <option value="VIDA">Vida</option>
                        <option value="OTROS">Otros</option>
                    </select>

                    <label htmlFor="estado">Estado</label>
                    <select id="estado" {...register("estado")}>
                        <option value="">Sin cambios</option>
                        <option value="ACTIVA">Activa</option>
                        <option value="VENCIDA">Vencida</option>
                        <option value="CANCELADA">Cancelada</option>
                        <option value="PENDIENTE">Pendiente</option>
                    </select>

                    <label htmlFor="fechaInicio">Fecha de Inicio</label>
                    <input id="fechaInicio" type="date" {...register("fechaInicio")} />

                    <label htmlFor="fechaVencimiento">Fecha de Vencimiento</label>
                    <input
                        id="fechaVencimiento"
                        type="date"
                        {...register("fechaVencimiento", {
                            validate: (value) =>
                                !value ||
                                !fechaInicio ||
                                value >= fechaInicio ||
                                "La fecha de vencimiento no puede ser anterior a la de inicio",
                        })}
                    />
                    {errors.fechaVencimiento && (
                        <span className="error">{errors.fechaVencimiento.message}</span>
                    )}

                    <label htmlFor="montoTotal">Monto Total</label>
                    <input
                        id="montoTotal"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        {...register("montoTotal", {
                            valueAsNumber: true,
                            min: { value: 0, message: "El monto no puede ser negativo" },
                        })}
                    />
                    {errors.montoTotal && (
                        <span className="error">{errors.montoTotal.message}</span>
                    )}

                    <label htmlFor="cuotas">Cuotas</label>
                    <input
                        id="cuotas"
                        type="number"
                        min="1"
                        step="1"
                        placeholder="1"
                        {...register("cuotas", {
                            valueAsNumber: true,
                            min: { value: 1, message: "Debe ser al menos 1 cuota" },
                        })}
                    />
                    {errors.cuotas && (
                        <span className="error">{errors.cuotas.message}</span>
                    )}

                    <label htmlFor="metodoPago">Método de Pago</label>
                    <select id="metodoPago" {...register("metodoPago")}>
                        <option value="">Sin cambios</option>
                        <option value="Efectivo">Efectivo</option>
                        <option value="Credito">Tarjeta de crédito</option>
                        <option value="Transferencia">Transferencia</option>
                        <option value="Debito">Débito automático</option>
                    </select>

                    <PolicyDetailFields tipoSeguro={tipoSeguro} register={register} />

                    <button type="submit" className="btn" disabled={isDisabled}>
                        Editar póliza
                    </button>
                </form>

            </div>
        </div>
    );
};

export default PoliciesEdit;