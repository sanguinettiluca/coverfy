import { useForm } from "react-hook-form";
import api from "../../data/api"
import { toast } from "react-toastify";

type ClienteForm = {
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

const ClientsNew = () => {
    const { register, handleSubmit, reset, formState: { errors } } = useForm<ClienteForm>();

    const onSubmit = (data: ClienteForm) => {
        console.log(data);
        api.post("/clientes", {
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

        }).then(response => {
            toast.success(response.data.message);
            reset();
        }).catch(error => {
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

                <h1 className="login-title">Ingresa un nuevo cliente</h1>
                <p className="login-sub">Completa los detalles debajo</p>

                <form className="login-form" autoComplete="on" onSubmit={handleSubmit(onSubmit)}>

                    <label htmlFor="nombres">Nombres</label>
                    <input
                        id="nombres"
                        type="text"
                        {...register("nombres", { required: true })}
                    />
                    {errors.nombres && <span className="error">Este campo es requerido</span>}

                    <label htmlFor="apellidos">Apellidos</label>
                    <input
                        id="apellidos"
                        type="text"
                        {...register("apellidos", { required: true })}
                    />
                    {errors.apellidos && <span className="error">Este campo es requerido</span>}

                    <label htmlFor="documento">Documento</label>
                    <input
                        id="documento"
                        type="number"
                        placeholder="Cédula o documento de identidad"
                        {...register("documento", { required: true })}
                    />
                    {errors.documento && <span className="error">Este campo es requerido</span>}

                    <label htmlFor="fechaNacimiento">Fecha de Nacimiento</label>
                    <input
                        id="fechaNacimiento"
                        type="date"
                        placeholder="Opcional"
                        {...register("fechaNacimiento")}
                    />

                    <label htmlFor="celular">Celular</label>
                    <input
                        id="celular"
                        type="tel"
                        {...register("celular", { required: true })}
                    />
                    {errors.celular && <span className="error">Este campo es requerido</span>}

                    <label htmlFor="celularAlternativo">Celular Alternativo</label>
                    <input
                        id="celularAlternativo"
                        type="tel"
                        placeholder="Opcional"
                        {...register("celularAlternativo")}
                    />

                    <label htmlFor="email">Email</label>
                    <input
                        id="email"
                        type="email"
                        {...register("email", {
                            required: true,
                            pattern: {
                                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                message: "Ingresa una dirección de correo válida",
                            },
                        })}
                    />
                    {errors.email && (
                        <span className="error">
                            {errors.email.message || "Este campo es requerido"}
                        </span>
                    )}

                    <label htmlFor="direccion">Dirección</label>
                    <input
                        id="direccion"
                        type="text"
                        {...register("direccion", { required: true })}
                    />
                    {errors.direccion && <span className="error">Este campo es requerido</span>}

                    <label htmlFor="notas">Notas</label>
                    <textarea
                        id="notas"
                        className="notas-textarea"
                        placeholder="Opcional"
                        rows={3}
                        {...register("notas")}
                    />

                    <button type="submit" className="btn">
                        Crear cliente
                    </button>
                </form>

            </div>
        </div>
    );
};

export default ClientsNew;