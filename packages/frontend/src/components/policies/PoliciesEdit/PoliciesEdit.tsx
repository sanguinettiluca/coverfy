import { useForm } from "react-hook-form";
import api from "../../../data/api";
import SearchPolicyButton from "../SearchPoliciyButton";
import { toast } from "react-toastify";
import PolicyDetailFields from "./PolicyDetailField";
import type { PolizaEditForm, PolizaDetalle } from "./policiesEdit.types";
import { Link } from "react-router";

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
                tipoSeguro: poliza.insuranceType,
                estado: poliza.status ?? undefined,
                fechaInicio: poliza.startDate
                    ? new Date(poliza.startDate).toISOString().slice(0, 10)
                    : undefined,
                fechaVencimiento: poliza.expirationDate
                    ? new Date(poliza.expirationDate).toISOString().slice(0, 10)
                    : undefined,
                montoTotal: poliza.totalAmount ?? undefined,
                cuotas: poliza.installments ?? undefined,
                metodoPago: poliza.paymentMethod ?? undefined,

                detalleResponsabilidadCivil: poliza.liabilityDetails
                    ? {
                        actividad: poliza.liabilityDetails.activity,
                        limiteCobertura: poliza.liabilityDetails.coverageLimit,
                    }
                    : undefined,

                detalleFianza: poliza.bondDetails
                    ? {
                        tipoFianza: poliza.bondDetails.bondType,
                        montoGarantizado: poliza.bondDetails.guaranteedAmount ?? undefined,
                        beneficiario: poliza.bondDetails.beneficiary,
                    }
                    : undefined,

                detalleVida: poliza.lifeDetails
                    ? {
                        sumaAsegurada: poliza.lifeDetails.insuredAmount ?? undefined,
                        beneficiario: poliza.lifeDetails.beneficiary,
                    }
                    : undefined,

                detalleOtros: poliza.otherDetails
                    ? { descripcion: poliza.otherDetails.description }
                    : undefined,

                detalleAlquiler: poliza.rentalDetails
                    ? {
                        direccion: poliza.rentalDetails.address,
                        tipoInmueble: poliza.rentalDetails.propertyType,
                        valorAlquiler: poliza.rentalDetails.rentAmount,
                    }
                    : undefined,

                detalleComercio: poliza.businessDetails
                    ? {
                        razonSocial: poliza.businessDetails.businessName,
                        rubro: poliza.businessDetails.industry,
                        direccion: poliza.businessDetails.address,
                    }
                    : undefined,

                detalleHogar: poliza.homeDetails
                    ? {
                        direccion: poliza.homeDetails.address,
                        tipoConstruccion: poliza.homeDetails.constructionType,
                        metrosCuadrados: poliza.homeDetails.squareMeters ?? undefined,
                        valorPropiedad: poliza.homeDetails.propertyValue,
                    }
                    : undefined,

                detalleVehiculo: poliza.vehicleDetails
                    ? {
                        marca: poliza.vehicleDetails.brand,
                        modelo: poliza.vehicleDetails.model,
                        anio: poliza.vehicleDetails.year,
                        matricula: poliza.vehicleDetails.licensePlate,
                        padron: poliza.vehicleDetails.registrationNumber,
                        chasis: poliza.vehicleDetails.chassisNumber,
                        motor: poliza.vehicleDetails.engineNumber,
                    }
                    : undefined,

                detalleViaje: poliza.tripDetails
                    ? {
                        destino: poliza.tripDetails.destination,
                        fechaSalida: poliza.tripDetails.departureDate
                            ? new Date(poliza.tripDetails.departureDate).toISOString().slice(0, 10)
                            : undefined,
                        fechaRegreso: poliza.tripDetails.returnDate
                            ? new Date(poliza.tripDetails.returnDate).toISOString().slice(0, 10)
                            : undefined,
                        pasajeros: poliza.tripDetails.passengers,
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

        const basePayload = {
            status: data.estado ? data.estado.toUpperCase() : undefined,

            startDate: data.fechaInicio
                ? new Date(data.fechaInicio).toISOString()
                : undefined,

            expirationDate: data.fechaVencimiento
                ? new Date(data.fechaVencimiento).toISOString()
                : undefined,

            totalAmount: data.montoTotal || undefined,
            installments: data.cuotas || undefined,
            paymentMethod: data.metodoPago || undefined,
        };

        let payload: Record<string, unknown> = basePayload;

        switch (data.tipoSeguro) {
            case "LIABILITY":
                payload = {
                    ...basePayload,
                    liabilityDetails: {
                        activity: data.detalleResponsabilidadCivil?.actividad,
                        coverageLimit: data.detalleResponsabilidadCivil?.limiteCobertura,
                    },
                };
                break;

            case "BOND":
                payload = {
                    ...basePayload,
                    bondDetails: {
                        bondType: data.detalleFianza?.tipoFianza,
                        guaranteedAmount: data.detalleFianza?.montoGarantizado,
                        beneficiary: data.detalleFianza?.beneficiario,
                    },
                };
                break;

            case "LIFE":
                payload = {
                    ...basePayload,
                    lifeDetails: {
                        insuredAmount: data.detalleVida?.sumaAsegurada,
                        beneficiary: data.detalleVida?.beneficiario,
                    },
                };
                break;

            case "OTHER":
                payload = {
                    ...basePayload,
                    otherDetails: {
                        description: data.detalleOtros?.descripcion,
                    },
                };
                break;

            case "RENTAL":
                payload = {
                    ...basePayload,
                    rentalDetails: {
                        address: data.detalleAlquiler?.direccion,
                        propertyType: data.detalleAlquiler?.tipoInmueble,
                        rentAmount: data.detalleAlquiler?.valorAlquiler,
                    },
                };
                break;

            case "BUSINESS":
                payload = {
                    ...basePayload,
                    businessDetails: {
                        businessName: data.detalleComercio?.razonSocial,
                        industry: data.detalleComercio?.rubro,
                        address: data.detalleComercio?.direccion,
                    },
                };
                break;

            case "HOME":
                payload = {
                    ...basePayload,
                    homeDetails: {
                        address: data.detalleHogar?.direccion,
                        constructionType: data.detalleHogar?.tipoConstruccion,
                        squareMeters: data.detalleHogar?.metrosCuadrados,
                        propertyValue: data.detalleHogar?.valorPropiedad,
                    },
                };
                break;

            case "VEHICLE":
                payload = {
                    ...basePayload,
                    vehicleDetails: {
                        brand: data.detalleVehiculo?.marca,
                        model: data.detalleVehiculo?.modelo,
                        year: data.detalleVehiculo?.anio,
                        licensePlate: data.detalleVehiculo?.matricula,
                        registrationNumber: data.detalleVehiculo?.padron,
                        chassisNumber: data.detalleVehiculo?.chasis,
                        engineNumber: data.detalleVehiculo?.motor,
                    },
                };
                break;

            case "TRIP":
                payload = {
                    ...basePayload,
                    tripDetails: {
                        destination: data.detalleViaje?.destino,
                        departureDate: data.detalleViaje?.fechaSalida
                            ? new Date(data.detalleViaje.fechaSalida).toISOString()
                            : undefined,
                        returnDate: data.detalleViaje?.fechaRegreso
                            ? new Date(data.detalleViaje.fechaRegreso).toISOString()
                            : undefined,
                        passengers: data.detalleViaje?.pasajeros,
                    },
                };
                break;
        }

        api.put(`/polizas/${data.polizaId}`, payload)
            .then(() => {
                toast.success("Póliza actualizada correctamente");
                reset({
                    polizaId: "",
                    numeroReferencia: "",
                    tipoSeguro: "",
                    estado: "" as any,
                    fechaInicio: "",
                    fechaVencimiento: "",
                    montoTotal: undefined,
                    cuotas: undefined,
                    metodoPago: "" as any,
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
                        <option value="VEHICLE">Vehículo</option>
                        <option value="TRIP">Viaje</option>
                        <option value="RENTAL">Alquiler</option>
                        <option value="HOME">Hogar</option>
                        <option value="BUSINESS">Comercio</option>
                        <option value="LIABILITY">Responsabilidad Civil</option>
                        <option value="BOND">Fianza</option>
                        <option value="LIFE">Vida</option>
                        <option value="OTHER">Otros</option>
                    </select>

                    <label htmlFor="estado">Estado</label>
                    <select id="estado" {...register("estado")}>
                        <option value="">Sin cambios</option>
                        <option value="ACTIVE">Activa</option>
                        <option value="EXPIRED">Vencida</option>
                        <option value="CANCELLED">Cancelada</option>
                        <option value="SUSPENDED">Suspendida</option>
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
                        <option value="Cash">Efectivo</option>
                        <option value="Credit">Tarjeta de crédito</option>
                        <option value="Transfer">Transferencia</option>
                        <option value="Debit">Débito automático</option>
                    </select>

                    <PolicyDetailFields tipoSeguro={tipoSeguro} register={register} />

                    <button type="submit" className="btn" disabled={isDisabled}>
                        Editar póliza
                    </button>
                </form>

                <p className="small">
                    <Link to="/policies/new">Registrar nueva póliza</Link>
                </p>

            </div>
        </div>
    );
};

export default PoliciesEdit;