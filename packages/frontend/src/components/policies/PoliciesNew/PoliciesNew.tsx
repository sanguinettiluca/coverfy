import { useForm } from "react-hook-form";
import api from "../../../data/api"
import { toast } from "react-toastify";
import CompanyCoverageSelect from "../CompanyCoverageSelect";
import ClientPicker from "../ClientPicker";
import NewPolicyDetailFields from "./NewPolicyDetailFields";
import type { PolizaForm } from "./policiesNew.type";

const PoliciesNew = () => {
    const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<PolizaForm>();

    const tipoSeguro = watch("tipoSeguro");
    const numeroPoliza = watch("numeroPoliza");
    const clienteId = watch("clienteId");
    const companiaId = watch("companiaId");
    const fechaInicio = watch("fechaInicio");
    const fechaVencimiento = watch("fechaVencimiento");

    const fechasInvalidas =
        !!fechaInicio && !!fechaVencimiento && fechaVencimiento < fechaInicio;

    const isDisabled =
        !tipoSeguro || !numeroPoliza || !clienteId || !companiaId || fechasInvalidas;

    const onSubmit = (data: PolizaForm) => {
        console.log(data.estado);

        api.post("/polizas", {
            tipoSeguro: data.tipoSeguro,
            numeroPoliza: data.numeroPoliza,
            numeroReferencia: data.numeroReferencia || undefined,
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
            clienteId: data.clienteId,
            companiaId: data.companiaId,
            coberturaId: data.coberturaId || undefined,

            detalleResponsabilidadCivil: data.detalleResponsabilidadCivil,
            detalleFianza: data.detalleFianza,
            detalleVida: data.detalleVida,
            detalleOtros: data.detalleOtros,
            detalleAlquiler: data.detalleAlquiler,
            detalleComercio: data.detalleComercio,
            detalleHogar: data.detalleHogar,
            detalleVehiculo: data.detalleVehiculo,
            detalleViaje: data.detalleViaje
                ? {
                    destino: data.detalleViaje.destino,
                    fechaSalida: data.detalleViaje.fechaSalida
                        ? new Date(data.detalleViaje.fechaSalida).toISOString()
                        : undefined,
                    fechaRegreso: data.detalleViaje.fechaRegreso
                        ? new Date(data.detalleViaje.fechaRegreso).toISOString()
                        : undefined,
                    pasajeros: data.detalleViaje.pasajeros,
                }
                : undefined,
        })
            .then(response => {
                toast.success(response.data.message);
                reset();
            })
            .catch(error => {
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

                <h1 className="login-title">Ingresa una nueva póliza</h1>
                <p className="login-sub">Completa los detalles debajo</p>

                <form className="login-form" autoComplete="on" onSubmit={handleSubmit(onSubmit)}>

                    <label htmlFor="tipoSeguro">Tipo de Seguro</label>
                    <select
                        id="tipoSeguro"
                        {...register("tipoSeguro", { required: true })}
                    >
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
                    {errors.tipoSeguro && <span className="error">Este campo es requerido</span>}

                    <label htmlFor="numeroPoliza">Número de Póliza</label>
                    <input
                        id="numeroPoliza"
                        type="text"
                        {...register("numeroPoliza", { required: true })}
                    />
                    {errors.numeroPoliza && <span className="error">Este campo es requerido</span>}

                    <label htmlFor="numeroReferencia">Número de Referencia</label>
                    <input
                        id="numeroReferencia"
                        type="text"
                        {...register("numeroReferencia")}
                    />
                    {errors.numeroReferencia && <span className="error">Este campo es requerido</span>}

                    <label htmlFor="estado">Estado</label>
                    <select id="estado" {...register("estado")}>
                        <option value="ACTIVA">Activa</option>
                    </select>

                    <label htmlFor="fechaInicio">Fecha de Inicio</label>
                    <input
                        id="fechaInicio"
                        type="date"
                        {...register("fechaInicio")}
                    />

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
                        <option value="">Elije un método de pago...</option>
                        <option value="Efectivo">Efectivo</option>
                        <option value="Credito">Tarjeta de crédito</option>
                        <option value="Transferencia">Transferencia</option>
                        <option value="Debito">Débito automático</option>
                    </select>

                    <input type="hidden" {...register("clienteId", { required: true })} />
                    <ClientPicker setValue={setValue as any} errors={errors} />

                    {errors.clienteId && (
                        <span className="error">Este campo es requerido</span>
                    )}

                    <CompanyCoverageSelect
                        register={register}
                        watch={watch}
                        setValue={setValue}
                        errors={errors}
                    />

                    <NewPolicyDetailFields tipoSeguro={tipoSeguro} register={register} errors={errors} />

                    <button type="submit" className="btn">
                        Crear Póliza
                    </button>

                </form>

            </div>
        </div>
    );
};

export default PoliciesNew;