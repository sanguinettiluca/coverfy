import { useForm } from "react-hook-form";
import api from "../../../data/api"
import { toast } from "react-toastify";
import { Upload, FileCheck } from "lucide-react";
import { useState } from "react";
import CompanyCoverageSelect from "../CompanyCoverageSelect";
import ClientPicker from "../ClientPicker";
import NewPolicyDetailFields from "./NewPolicyDetailFields";
import type { PolizaForm } from "./policiesNew.type";

const PoliciesNew = () => {
    const {
        register,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { errors }
    } = useForm<PolizaForm>({
        shouldUnregister: true,
    });

    const [fileName, setFileName] = useState<string | null>(null);

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

        if(isDisabled) { // NO SACAR!!! ROMPE EL BUILD

        }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFileName(file.name);
            scanPolicyDocument(file);
        }
    };

    const scanPolicyDocument = async (file: File) => {
        try {
            const formData = new FormData();
            formData.append("file", file);

            const { data } = await api.post("ocr/poliza", formData);

            if (data.insuranceType) {
                setValue("tipoSeguro", data.insuranceType, { shouldValidate: true });
            }
            if (data.policyNumber) {
                setValue("numeroPoliza", data.policyNumber, { shouldValidate: true });
            }
            if (data.startDate) {
                setValue("fechaInicio", data.startDate);
            }
            if (data.expirationDate) {
                setValue("fechaVencimiento", data.expirationDate);
            }
            if (data.totalAmount != null) {
                setValue("montoTotal", data.totalAmount);
            }

            toast.success("Datos extraídos correctamente");
        } catch (error: any) {
            if (error.response) {
                toast.error(error.response.data.message);
            } else {
                toast.error("Error al escanear la póliza");
            }
        }
    };

    const onSubmit = (data: PolizaForm) => {
        const basePayload = {
            insuranceType: data.tipoSeguro,
            policyNumber: data.numeroPoliza,
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
            clientId: data.clienteId,
            companyId: data.companiaId,
            coverageId: data.coberturaId || undefined,
        };

        let payload: Record<string, unknown>;

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
            default:
                payload = basePayload;
        }

        api.post("/polizas", payload)
            .then(response => {
                toast.success(response.data.message);
                reset();
                setFileName(null);
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

                    <label htmlFor="policyFile">Escanear póliza</label>
                    <div className="file-upload">
                        <input
                            id="policyFile"
                            type="file"
                            accept=".pdf"
                            className="file-upload-input"
                            onChange={handleFileChange}
                        />
                        <label htmlFor="policyFile" className="file-upload-label">
                            {fileName ? <FileCheck size={16} /> : <Upload size={16} />}
                            {fileName ? "Cambiar archivo" : "Subir PDF de la póliza"}
                        </label>
                        {fileName && (
                            <span className="file-upload-filename file-upload-filename--active">
                                {fileName}
                            </span>
                        )}
                    </div>

                    <label htmlFor="tipoSeguro">Tipo de Seguro</label>
                    <select
                        id="tipoSeguro"
                        {...register("tipoSeguro", { required: true })}
                    >
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
                    {errors.tipoSeguro && <span className="error">Este campo es requerido</span>}

                    <label htmlFor="numeroPoliza">Número de Póliza</label>
                    <input
                        id="numeroPoliza"
                        type="text"
                        {...register("numeroPoliza", { required: true })}
                    />
                    {errors.numeroPoliza && <span className="error">Este campo es requerido</span>}

                    <label htmlFor="estado">Estado</label>
                    <select id="estado" {...register("estado")}>
                        <option value="ACTIVE">Activa</option>
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
                        <option value="Cash">Efectivo</option>
                        <option value="Credit">Tarjeta de crédito</option>
                        <option value="Transfer">Transferencia</option>
                        <option value="Debit">Débito automático</option>
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