import { useForm } from "react-hook-form";
import { Link } from "react-router";
import SearchClientButton from "./SearchClientButton";
import api from "../../data/api"
import { toast } from "react-toastify";

type UpdateClienteForm = {
    clienteId: string;
    nombres?: string;
    apellidos?: string;
    documento?: string;
    fechaNacimiento?: string;
    celular?: string;
    celularAlternativo?: string;
    email?: string;
    direccion?: string;
    notas?: string;
};


const ClientsEdit = () => {
    const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<UpdateClienteForm>();

    const limpiarFormulario = () => {
        reset({
            clienteId: "",
            nombres: "",
            apellidos: "",
            documento: "",
            fechaNacimiento: "",
            celular: "",
            celularAlternativo: "",
            email: "",
            direccion: "",
            notas: ""
        });
    };

    const clienteId = watch("clienteId");

    const documento = watch("documento");

    const isDisabled = !clienteId;

    const onSubmit = (data: UpdateClienteForm) => {
        api.put(`/clientes/${data.clienteId}`, {
            nombres: data.nombres,
            apellidos: data.apellidos,
            documento: data.documento,
            fechaNacimiento: data.fechaNacimiento ? new Date(data.fechaNacimiento).toISOString()
                : undefined,
            celular: data.celular,
            celularAlternativo: data.celularAlternativo || undefined,
            email: data.email,
            direccion: data.direccion,
            notas: data.notas || undefined
        })
            .then(() => {
                toast.success("Cliente actualizado correctamente");
                limpiarFormulario();
            })
            .catch(() => {
                toast.error("Error al actualizar cliente");
            });
    };

    return (
        <div className="page">
            <div className="login-card">

                <h1 className="login-title">Editar Cliente</h1>
                <p className="login-sub">Completa los detalles debajo</p>

                <form className="login-form" autoComplete="on" onSubmit={handleSubmit(onSubmit)}>


                    {errors.clienteId && <span className="error">Este campo es requerido</span>}

                    <label htmlFor="nombres">Nombres</label>
                    <input
                        id="nombres"
                        type="text"
                        placeholder="Sin cambios"
                        {...register("nombres")}
                    />

                    <label htmlFor="apellidos">Apellidos</label>
                    <input
                        id="apellidos"
                        type="text"
                        placeholder="Sin cambios"
                        {...register("apellidos")}
                    />

                    <label htmlFor="documento">Documento</label>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                        <input
                            id="documento"
                            type="text"
                            placeholder="Sin cambios"
                            {...register("documento")}
                        />
                        <SearchClientButton
                            documento={documento ?? ""}
                            onEncontrado={(cliente) => {
                                reset({
                                    clienteId: cliente.id,
                                    nombres: cliente.nombres,
                                    apellidos: cliente.apellidos,
                                    documento: cliente.documento,
                                    fechaNacimiento: cliente.fechaNacimiento?.slice(0, 10),
                                    celular: cliente.celular,
                                    celularAlternativo: cliente.celularAlternativo,
                                    email: cliente.email,
                                    direccion: cliente.direccion,
                                    notas: cliente.notas,
                                });
                            }}
                            onNoEncontrado={limpiarFormulario}
                        />
                    </div>
                    {errors.documento && <span className="error">Este campo es requerido</span>}

                    <label htmlFor="fechaNacimiento">Fecha de Nacimiento</label>
                    <input
                        id="fechaNacimiento"
                        type="date"
                        {...register("fechaNacimiento")}
                    />

                    <label htmlFor="celular">Celular</label>
                    <input
                        id="celular"
                        type="tel"
                        placeholder="Sin cambios"
                        {...register("celular")}
                    />

                    <label htmlFor="celularAlternativo">Celular Alternativo</label>
                    <input
                        id="celularAlternativo"
                        type="tel"
                        placeholder="Sin cambios"
                        {...register("celularAlternativo")}
                    />

                    <label htmlFor="email">Email</label>
                    <input
                        id="email"
                        type="email"
                        placeholder="Sin cambios"
                        {...register("email", {
                            pattern: {
                                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                message: "Ingresa una dirección de correo válida",
                            },
                        })}
                    />
                    {errors.email && <span className="error">{errors.email.message}</span>}

                    <label htmlFor="direccion">Dirección</label>
                    <input
                        id="direccion"
                        type="text"
                        placeholder="Sin cambios"
                        {...register("direccion")}
                    />

                    <label htmlFor="notas">Notas</label>
                    <textarea
                        id="notas"
                        className="notas-textarea"
                        placeholder="Sin cambios"
                        rows={3}
                        {...register("notas")}
                    />

                    <button type="submit" className="btn" disabled={isDisabled}>
                        Editar cliente
                    </button>
                </form>

                <p className="small">
                    <Link to="/clientes">Volver</Link>
                </p>
            </div>
        </div>
    );
};

export default ClientsEdit;