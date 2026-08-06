import { useForm } from "react-hook-form";
import { Link, Navigate } from "react-router";
import api from "../data/api"
import { toast } from "react-toastify";
import BrokerSelect from "./BrokerSelect";

type Role = "ADMIN" | "BROKER" | "SUB_BROKER";

type RegisterForm = {
    name: string;
    email: string;
    password: string;
    confirm_password: string;
    role: Role;
    broker_id?: string;
    
};

const Register = () => {
    const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<RegisterForm>();

    const role = watch("role");
    const isSubBroker = role === "SUB_BROKER";
    const brokerId = watch("broker_id");



    const onSubmit = (data: RegisterForm) => {

        api.post("/auth/users", {
            name: data.name,
            email: data.email,
            password: data.password,
            role: data.role,
            brokerId: data.broker_id || undefined
        })
            .then(response => {
                toast.success(response.data.message);
                <Navigate to="/register"  />
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

                <h1 className="login-title">Ingresa un nuevo usuario</h1>
                <p className="login-sub">Completa los detalles debajo</p>

                <form className="login-form" autoComplete="on" onSubmit={handleSubmit(onSubmit)}>

                    <label htmlFor="name">Nombre Completo</label>
                    <input
                        id="name"
                        type="text"
                        {...register("name", { required: true })}
                    />
                    {errors.name && <span className="error">Este campo es requerido</span>}

                    <label htmlFor="email">Email</label>
                    <input
                        id="email"
                        type="email"
                        placeholder="empleado@ejemplo.com"
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

                    <label htmlFor="password">Contraseña</label>
                    <input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        {...register("password", {
                            required: true,
                            minLength: { value: 10, message: "La contraseña debe tener al menos 10 caracteres" },
                        })}
                    />
                    {errors.password && (
                        <span className="error">
                            {errors.password.message || "Este campo es requerido"}
                        </span>
                    )}

                    <label htmlFor="confirm_password">Confirmar Contraseña</label>
                    <input
                        id="confirm_password"
                        type="password"
                        placeholder="••••••••"
                        {...register("confirm_password", {
                            required: "Este campo es requerido",
                            validate: (value) =>
                                value === watch("password") || "Las contraseñas no coinciden",
                        })}
                    />
                    {errors.confirm_password && (
                        <span className="error">
                            {errors.confirm_password.message}
                        </span>
                    )}

                    <label htmlFor="role">Rol</label>
                    <select
                        id="role"
                        {...register("role", { required: true })}
                    >
                        <option value="">Elije un rol...</option>
                        <option value="BROKER">Broker</option>
                        <option value="SUB_BROKER">Sub broker</option>
                    </select>
                    {errors.role && <span className="error">Este campo es requerido</span>}

                    {isSubBroker && (
                        <>
                            <label htmlFor="broker_id">Broker</label>
                            <input type="hidden" {...register("broker_id", { required: isSubBroker })} />
                            <BrokerSelect
                                id="broker_id_select"
                                value={brokerId}
                                onChange={(value) => setValue("broker_id", value, { shouldValidate: true })}
                            />
                            {errors.broker_id && <span className="error">Este campo es requerido</span>}
                        </>
                    )}

                    <button type="submit" className="btn" >
                        Crear Cuenta
                    </button>
                </form>

                <p className="small">
                    <Link to="/dashboard">Volver</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;