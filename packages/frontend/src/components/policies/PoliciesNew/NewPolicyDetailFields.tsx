import type { UseFormRegister, FieldErrors } from "react-hook-form";
import type { PolizaForm, TipoSeguro } from "./policiesNew.type";

type Props = {
    tipoSeguro: TipoSeguro | "";
    register: UseFormRegister<PolizaForm>;
    errors: FieldErrors<PolizaForm>;
};

const NewPolicyDetailFields = ({ tipoSeguro, register, errors }: Props) => {
    return (
        <>
            {tipoSeguro === "RESPONSABILIDAD_CIVIL" && (
                <>
                    <label htmlFor="rc_actividad">Actividad</label>
                    <input
                        id="rc_actividad"
                        type="text"
                        {...register("detalleResponsabilidadCivil.actividad", { required: true })}
                    />
                    {errors.detalleResponsabilidadCivil?.actividad && (
                        <span className="error">Este campo es requerido</span>
                    )}

                    <label htmlFor="rc_limite">Límite de Cobertura</label>
                    <input
                        id="rc_limite"
                        type="number"
                        {...register("detalleResponsabilidadCivil.limiteCobertura", {
                            required: true,
                            valueAsNumber: true,
                        })}
                    />
                    {errors.detalleResponsabilidadCivil?.limiteCobertura && (
                        <span className="error">Este campo es requerido</span>
                    )}
                </>
            )}

            {tipoSeguro === "FIANZA" && (
                <>
                    <label htmlFor="fianza_tipo">Tipo de Fianza</label>
                    <input
                        id="fianza_tipo"
                        type="text"
                        {...register("detalleFianza.tipoFianza", { required: true })}
                    />
                    {errors.detalleFianza?.tipoFianza && (
                        <span className="error">Este campo es requerido</span>
                    )}

                    <label htmlFor="fianza_monto">Monto Garantizado</label>
                    <input
                        id="fianza_monto"
                        type="number"
                        placeholder="Opcional"
                        {...register("detalleFianza.montoGarantizado", { valueAsNumber: true })}
                    />

                    <label htmlFor="fianza_beneficiario">Beneficiario</label>
                    <input
                        id="fianza_beneficiario"
                        type="text"
                        {...register("detalleFianza.beneficiario", { required: true })}
                    />
                    {errors.detalleFianza?.beneficiario && (
                        <span className="error">Este campo es requerido</span>
                    )}
                </>
            )}

            {tipoSeguro === "VIDA" && (
                <>
                    <label htmlFor="vida_suma">Suma Asegurada</label>
                    <input
                        id="vida_suma"
                        type="number"
                        placeholder="Opcional"
                        {...register("detalleVida.sumaAsegurada", { valueAsNumber: true })}
                    />

                    <label htmlFor="vida_beneficiario">Beneficiario</label>
                    <input
                        id="vida_beneficiario"
                        type="text"
                        {...register("detalleVida.beneficiario", { required: true })}
                    />
                    {errors.detalleVida?.beneficiario && (
                        <span className="error">Este campo es requerido</span>
                    )}
                </>
            )}

            {tipoSeguro === "OTROS" && (
                <>
                    <label htmlFor="otros_desc">Descripción</label>
                    <input
                        id="otros_desc"
                        type="text"
                        {...register("detalleOtros.descripcion", { required: true })}
                    />
                    {errors.detalleOtros?.descripcion && (
                        <span className="error">Este campo es requerido</span>
                    )}
                </>
            )}

            {tipoSeguro === "ALQUILER" && (
                <>
                    <label htmlFor="alq_direccion">Dirección</label>
                    <input
                        id="alq_direccion"
                        type="text"
                        {...register("detalleAlquiler.direccion", { required: true })}
                    />
                    {errors.detalleAlquiler?.direccion && (
                        <span className="error">Este campo es requerido</span>
                    )}

                    <label htmlFor="alq_tipo">Tipo de Inmueble</label>
                    <input
                        id="alq_tipo"
                        type="text"
                        {...register("detalleAlquiler.tipoInmueble", { required: true })}
                    />
                    {errors.detalleAlquiler?.tipoInmueble && (
                        <span className="error">Este campo es requerido</span>
                    )}

                    <label htmlFor="alq_valor">Valor de Alquiler</label>
                    <input
                        id="alq_valor"
                        type="number"
                        {...register("detalleAlquiler.valorAlquiler", {
                            required: true,
                            valueAsNumber: true,
                        })}
                    />
                    {errors.detalleAlquiler?.valorAlquiler && (
                        <span className="error">Este campo es requerido</span>
                    )}

                    <label htmlFor="alq_deposito">Depósito</label>
                    <input
                        id="alq_deposito"
                        type="number"
                        {...register("detalleAlquiler.deposito", {
                            required: true,
                            valueAsNumber: true,
                        })}
                    />
                    {errors.detalleAlquiler?.deposito && (
                        <span className="error">Este campo es requerido</span>
                    )}
                </>
            )}

            {tipoSeguro === "COMERCIO" && (
                <>
                    <label htmlFor="com_razon">Razón Social</label>
                    <input
                        id="com_razon"
                        type="text"
                        {...register("detalleComercio.razonSocial", { required: true })}
                    />
                    {errors.detalleComercio?.razonSocial && (
                        <span className="error">Este campo es requerido</span>
                    )}

                    <label htmlFor="com_rubro">Rubro</label>
                    <input
                        id="com_rubro"
                        type="text"
                        {...register("detalleComercio.rubro", { required: true })}
                    />
                    {errors.detalleComercio?.rubro && (
                        <span className="error">Este campo es requerido</span>
                    )}

                    <label htmlFor="com_direccion">Dirección</label>
                    <input
                        id="com_direccion"
                        type="text"
                        {...register("detalleComercio.direccion", { required: true })}
                    />
                    {errors.detalleComercio?.direccion && (
                        <span className="error">Este campo es requerido</span>
                    )}
                </>
            )}

            {tipoSeguro === "HOGAR" && (
                <>
                    <label htmlFor="hogar_direccion">Dirección</label>
                    <input
                        id="hogar_direccion"
                        type="text"
                        {...register("detalleHogar.direccion", { required: true })}
                    />
                    {errors.detalleHogar?.direccion && (
                        <span className="error">Este campo es requerido</span>
                    )}

                    <label htmlFor="hogar_construccion">Tipo de Construcción</label>
                    <input
                        id="hogar_construccion"
                        type="text"
                        {...register("detalleHogar.tipoConstruccion", { required: true })}
                    />
                    {errors.detalleHogar?.tipoConstruccion && (
                        <span className="error">Este campo es requerido</span>
                    )}

                    <label htmlFor="hogar_metros">Metros Cuadrados</label>
                    <input
                        id="hogar_metros"
                        type="number"
                        placeholder="Opcional"
                        {...register("detalleHogar.metrosCuadrados", { valueAsNumber: true })}
                    />

                    <label htmlFor="hogar_valor">Valor de la Propiedad</label>
                    <input
                        id="hogar_valor"
                        type="number"
                        {...register("detalleHogar.valorPropiedad", {
                            required: true,
                            valueAsNumber: true,
                        })}
                    />
                    {errors.detalleHogar?.valorPropiedad && (
                        <span className="error">Este campo es requerido</span>
                    )}
                </>
            )}

            {tipoSeguro === "VEHICULO" && (
                <>
                    <label htmlFor="veh_marca">Marca</label>
                    <input
                        id="veh_marca"
                        type="text"
                        {...register("detalleVehiculo.marca", { required: true })}
                    />
                    {errors.detalleVehiculo?.marca && (
                        <span className="error">Este campo es requerido</span>
                    )}

                    <label htmlFor="veh_modelo">Modelo</label>
                    <input
                        id="veh_modelo"
                        type="text"
                        {...register("detalleVehiculo.modelo", { required: true })}
                    />
                    {errors.detalleVehiculo?.modelo && (
                        <span className="error">Este campo es requerido</span>
                    )}

                    <label htmlFor="veh_anio">Año</label>
                    <input
                        id="veh_anio"
                        type="number"
                        {...register("detalleVehiculo.anio", {
                            required: true,
                            valueAsNumber: true,
                        })}
                    />
                    {errors.detalleVehiculo?.anio && (
                        <span className="error">Este campo es requerido</span>
                    )}

                    <label htmlFor="veh_matricula">Matrícula</label>
                    <input
                        id="veh_matricula"
                        type="text"
                        {...register("detalleVehiculo.matricula", { required: true })}
                    />
                    {errors.detalleVehiculo?.matricula && (
                        <span className="error">Este campo es requerido</span>
                    )}

                    <label htmlFor="veh_padron">Padrón</label>
                    <input
                        id="veh_padron"
                        type="text"
                        {...register("detalleVehiculo.padron", { required: true })}
                    />
                    {errors.detalleVehiculo?.padron && (
                        <span className="error">Este campo es requerido</span>
                    )}

                    <label htmlFor="veh_chasis">Chasis</label>
                    <input
                        id="veh_chasis"
                        type="text"
                        {...register("detalleVehiculo.chasis", { required: true })}
                    />
                    {errors.detalleVehiculo?.chasis && (
                        <span className="error">Este campo es requerido</span>
                    )}

                    <label htmlFor="veh_motor">Motor</label>
                    <input
                        id="veh_motor"
                        type="text"
                        {...register("detalleVehiculo.motor", { required: true })}
                    />
                    {errors.detalleVehiculo?.motor && (
                        <span className="error">Este campo es requerido</span>
                    )}
                </>
            )}

            {tipoSeguro === "VIAJE" && (
                <>
                    <label htmlFor="viaje_destino">Destino</label>
                    <input
                        id="viaje_destino"
                        type="text"
                        {...register("detalleViaje.destino", { required: true })}
                    />
                    {errors.detalleViaje?.destino && (
                        <span className="error">Este campo es requerido</span>
                    )}

                    <label htmlFor="viaje_salida">Fecha de Salida</label>
                    <input
                        id="viaje_salida"
                        type="date"
                        {...register("detalleViaje.fechaSalida", { required: true })}
                    />
                    {errors.detalleViaje?.fechaSalida && (
                        <span className="error">Este campo es requerido</span>
                    )}

                    <label htmlFor="viaje_regreso">Fecha de Regreso</label>
                    <input
                        id="viaje_regreso"
                        type="date"
                        {...register("detalleViaje.fechaRegreso", { required: true })}
                    />
                    {errors.detalleViaje?.fechaRegreso && (
                        <span className="error">Este campo es requerido</span>
                    )}

                    <label htmlFor="viaje_pasajeros">Pasajeros</label>
                    <input
                        id="viaje_pasajeros"
                        type="number"
                        min="1"
                        {...register("detalleViaje.pasajeros", {
                            required: true,
                            valueAsNumber: true,
                        })}
                    />
                    {errors.detalleViaje?.pasajeros && (
                        <span className="error">Este campo es requerido</span>
                    )}
                </>
            )}
        </>
    );
};

export default NewPolicyDetailFields;