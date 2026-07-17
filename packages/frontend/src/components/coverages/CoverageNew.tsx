import { useForm } from "react-hook-form";
import api from "../../data/api";
import { toast } from "react-toastify";
import CompanySelect from "./CompanySelect"; 
type TipoSeguro =
    | "VEHICULO"
    | "VIAJE"
    | "ALQUILER"
    | "HOGAR"
    | "COMERCIO"
    | "RESPONSABILIDAD_CIVIL"
    | "FIANZA"
    | "VIDA"
    | "OTROS";

type CoverageForm = {
    nombre: string;
    tipoSeguro: TipoSeguro | "";
    companiaId: string;
};

const CoverageNew = () => {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm<CoverageForm>();

    const onSubmit = (data: CoverageForm) => {
        api.post("/coberturas", {
            nombre: data.nombre,
            tipoSeguro: data.tipoSeguro,
            companiaId: data.companiaId
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

                <h1 className="login-title">Ingresa una nueva cobertura</h1>
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

                    <label htmlFor="tipoSeguro">Tipo de Seguro</label>
                    <select
                        id="tipoSeguro"
                        {...register("tipoSeguro", { required: true })}
                    >
                        <option value="">Seleccione un tipo de seguro...</option>
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
                    {errors.tipoSeguro && (
                        <span className="error">
                            Este campo es requerido
                        </span>
                    )}

                    <CompanySelect register={register} errors={errors} />

                    <button type="submit" className="btn">
                        Crear cobertura
                    </button>

                </form>

            </div>
        </div>
    );
};

export default CoverageNew;