import { useForm } from "react-hook-form";
import api from "../../data/api";
import { toast } from "react-toastify";

type CompanyForm = {
    name: string;
    commissionRate?: number;
    url?: string;
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
            name: data.name,
            commissionRate: data.commissionRate ?? undefined,
            url: data.url || undefined
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
                        {...register("name", { required: true })}
                    />
                    {errors.name && (
                        <span className="error">
                            Este campo es requerido
                        </span>
                    )}

                    <label htmlFor="comissionRate">
                        Porcentaje de Comisión
                    </label>
                    <input
                        id="comissionRate"
                        type="number"
                        step="0.01"
                        placeholder="Opcional"
                        {...register("commissionRate", {
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
                    {errors.commissionRate && (
                        <span className="error">
                            {errors.commissionRate.message}
                        </span>
                    )}

                    <label htmlFor="url">
                        Sitio web
                    </label>
                    <input
                        id="url"
                        type="url"
                        placeholder="https://www.aseguradora.com"
                        {...register("url", {
                            pattern: {
                                value: /^https?:\/\/.+/i,
                                message: "Debe ser una URL válida, comenzando con http:// o https://"
                            }
                        })}
                    />
                    {errors.url && (
                        <span className="error">
                            {errors.url.message}
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