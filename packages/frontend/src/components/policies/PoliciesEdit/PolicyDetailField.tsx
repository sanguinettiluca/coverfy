import type { UseFormRegister } from "react-hook-form";
import type { PolizaEditForm, TipoSeguro } from "./policiesEdit.types";

type Props = {
    tipoSeguro: TipoSeguro | "";
    register: UseFormRegister<PolizaEditForm>;
};

const PolicyDetailFields = ({ tipoSeguro, register }: Props) => {
    return (
        <>
            {tipoSeguro === "LIABILITY" && (
                <>
                    <label htmlFor="rc_actividad">Actividad</label>
                    <input
                        id="rc_actividad"
                        type="text"
                        {...register("detalleResponsabilidadCivil.actividad")}
                    />

                    <label htmlFor="rc_limite">Límite de Cobertura</label>
                    <input
                        id="rc_limite"
                        type="number"
                        {...register("detalleResponsabilidadCivil.limiteCobertura", { valueAsNumber: true })}
                    />
                </>
            )}

            {tipoSeguro === "BOND" && (
                <>
                    <label htmlFor="fianza_tipo">Tipo de Fianza</label>
                    <input id="fianza_tipo" type="text" {...register("detalleFianza.tipoFianza")} />

                    <label htmlFor="fianza_monto">Monto Garantizado</label>
                    <input
                        id="fianza_monto"
                        type="number"
                        {...register("detalleFianza.montoGarantizado", { valueAsNumber: true })}
                    />

                    <label htmlFor="fianza_beneficiario">Beneficiario</label>
                    <input id="fianza_beneficiario" type="text" {...register("detalleFianza.beneficiario")} />
                </>
            )}

            {tipoSeguro === "LIFE" && (
                <>
                    <label htmlFor="vida_suma">Suma Asegurada</label>
                    <input
                        id="vida_suma"
                        type="number"
                        {...register("detalleVida.sumaAsegurada", { valueAsNumber: true })}
                    />

                    <label htmlFor="vida_beneficiario">Beneficiario</label>
                    <input id="vida_beneficiario" type="text" {...register("detalleVida.beneficiario")} />
                </>
            )}

            {tipoSeguro === "OTHER" && (
                <>
                    <label htmlFor="otros_desc">Descripción</label>
                    <input id="otros_desc" type="text" {...register("detalleOtros.descripcion")} />
                </>
            )}

            {tipoSeguro === "RENTAL" && (
                <>
                    <label htmlFor="alq_direccion">Dirección</label>
                    <input id="alq_direccion" type="text" {...register("detalleAlquiler.direccion")} />

                    <label htmlFor="alq_tipo">Tipo de Inmueble</label>
                    <input id="alq_tipo" type="text" {...register("detalleAlquiler.tipoInmueble")} />

                    <label htmlFor="alq_valor">Valor de Alquiler</label>
                    <input
                        id="alq_valor"
                        type="number"
                        {...register("detalleAlquiler.valorAlquiler", { valueAsNumber: true })}
                    />
                </>
            )}

            {tipoSeguro === "BUSINESS" && (
                <>
                    <label htmlFor="com_razon">Razón Social</label>
                    <input id="com_razon" type="text" {...register("detalleComercio.razonSocial")} />

                    <label htmlFor="com_rubro">Rubro</label>
                    <input id="com_rubro" type="text" {...register("detalleComercio.rubro")} />

                    <label htmlFor="com_direccion">Dirección</label>
                    <input id="com_direccion" type="text" {...register("detalleComercio.direccion")} />
                </>
            )}

            {tipoSeguro === "HOME" && (
                <>
                    <label htmlFor="hogar_direccion">Dirección</label>
                    <input id="hogar_direccion" type="text" {...register("detalleHogar.direccion")} />

                    <label htmlFor="hogar_construccion">Tipo de Construcción</label>
                    <input id="hogar_construccion" type="text" {...register("detalleHogar.tipoConstruccion")} />

                    <label htmlFor="hogar_metros">Metros Cuadrados</label>
                    <input
                        id="hogar_metros"
                        type="number"
                        {...register("detalleHogar.metrosCuadrados", { valueAsNumber: true })}
                    />

                    <label htmlFor="hogar_valor">Valor de la Propiedad</label>
                    <input
                        id="hogar_valor"
                        type="number"
                        {...register("detalleHogar.valorPropiedad", { valueAsNumber: true })}
                    />
                </>
            )}

            {tipoSeguro === "VEHICLE" && (
                <>
                    <label htmlFor="veh_marca">Marca</label>
                    <input id="veh_marca" type="text" {...register("detalleVehiculo.marca")} />

                    <label htmlFor="veh_modelo">Modelo</label>
                    <input id="veh_modelo" type="text" {...register("detalleVehiculo.modelo")} />

                    <label htmlFor="veh_anio">Año</label>
                    <input
                        id="veh_anio"
                        type="number"
                        {...register("detalleVehiculo.anio", { valueAsNumber: true })}
                    />

                    <label htmlFor="veh_matricula">Matrícula</label>
                    <input id="veh_matricula" type="text" {...register("detalleVehiculo.matricula")} />

                    <label htmlFor="veh_padron">Padrón</label>
                    <input id="veh_padron" type="text" {...register("detalleVehiculo.padron")} />

                    <label htmlFor="veh_chasis">Chasis</label>
                    <input id="veh_chasis" type="text" {...register("detalleVehiculo.chasis")} />

                    <label htmlFor="veh_motor">Motor</label>
                    <input id="veh_motor" type="text" {...register("detalleVehiculo.motor")} />
                </>
            )}

            {tipoSeguro === "TRIP" && (
                <>
                    <label htmlFor="viaje_destino">Destino</label>
                    <input id="viaje_destino" type="text" {...register("detalleViaje.destino")} />

                    <label htmlFor="viaje_salida">Fecha de Salida</label>
                    <input id="viaje_salida" type="date" {...register("detalleViaje.fechaSalida")} />

                    <label htmlFor="viaje_regreso">Fecha de Regreso</label>
                    <input id="viaje_regreso" type="date" {...register("detalleViaje.fechaRegreso")} />

                    <label htmlFor="viaje_pasajeros">Pasajeros</label>
                    <input
                        id="viaje_pasajeros"
                        type="number"
                        min="1"
                        {...register("detalleViaje.pasajeros", { valueAsNumber: true })}
                    />
                </>
            )}
        </>
    );
};

export default PolicyDetailFields;