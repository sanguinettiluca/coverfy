import { useForm } from "react-hook-form";
import api from "../../data/api";
import { toast } from "react-toastify";

type CompanyForm = {
    nombre: string;
    porcentajeComision?: number;
};

const CompanyNew = () => {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm<CompanyForm>();

    const onSubmit = (data: CompanyForm) => {
        api.post("/companias", {
            nombre: data.nombre,
            porcentajeComision: data.porcentajeComision ?? undefined
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

                <h1 className="login-title">Ingresa una nueva compañía</h1>
                <p className="login-sub">Completa los detalles debajo</p>

                <form
                    className="login-form"
                    autoComplete="on"
                    onSubmit={handleSubmit(onSubmit)}
                >

                    <label htmlFor="nombre">Nombre</label>
                    <input
                        id="nombre"
                        type="text"
                        {...register("nombre", { required: true })}
                    />
                    {errors.nombre && (
                        <span className="error">
                            Este campo es requerido
                        </span>
                    )}

                    <label htmlFor="porcentajeComision">
                        Porcentaje de Comisión
                    </label>
                    <input
                        id="porcentajeComision"
                        type="number"
                        step="0.01"
                        placeholder="Opcional"
                        {...register("porcentajeComision", {
                            valueAsNumber: true,
                            min: {
                                value: 0,
                                message: "Debe ser mayor o igual a 0"
                            },
                            max: {
                                value: 100,
                                message: "No puede ser mayor a 100"
                            }
                        })}
                    />
                    {errors.porcentajeComision && (
                        <span className="error">
                            {errors.porcentajeComision.message}
                        </span>
                    )}

                    <button type="submit" className="btn">
                        Crear compañía
                    </button>

                </form>

            </div>
        </div>
    );
};

export default CompanyNew;