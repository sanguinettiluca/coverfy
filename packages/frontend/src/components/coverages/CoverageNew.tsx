import { useForm } from "react-hook-form";
import api from "../../data/api";
import { toast } from "react-toastify";
import CompanySelect from "./CompanySelect";
import type { CoverageForm } from "../coverages/CoverageTypes";

const CoverageNew = () => {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm<CoverageForm>();

    const onSubmit = (data: CoverageForm) => {
        api.post("/coberturas", {
            name: data.name,
            insuranceType: data.insuranceType,
            companyId: data.companyId
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

                    <label htmlFor="name">Nombre</label>
                    <input
                        id="name"
                        type="text"
                        {...register("name", { required: true })}
                    />
                    {errors.name && (
                        <span className="error">
                            Este campo es requerido
                        </span>
                    )}

                    <label htmlFor="insuranceType">Tipo de Seguro</label>
                    <select
                        id="insuranceType"
                        {...register("insuranceType", { required: true })}
                    >
                        <option value="">Seleccione un tipo de seguro...</option>
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
                    {errors.insuranceType && (
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