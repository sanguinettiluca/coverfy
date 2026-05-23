import { useForm } from "react-hook-form";
import { Link } from "react-router";

type Role = "admin" | "broker" | "sub_broker";

type RegisterForm = {
    name: string;
    email: string;
    password: string;
    role: Role;
    broker_id?: string;
};

const Register = () => {
    const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterForm>();

    const role = watch("role");
    const isSubBroker = role === "sub_broker";

    const name = watch("name");
    const email = watch("email");
    const password = watch("password");
    const brokerId = watch("broker_id");

    const isDisabled = !name || !email || !password || !role || (isSubBroker && !brokerId);

    const onSubmit = (data: RegisterForm) => {
        console.log(data);
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
                            minLength: { value: 8, message: "La contraseña debe tener al menos 8 caracteres" },
                        })}
                    />
                    {errors.password && (
                        <span className="error">
                            {errors.password.message || "Este campo es requerido"}
                        </span>
                    )}

                    <label htmlFor="role">Rol</label>
                    <select
                        id="role"
                        {...register("role", { required: true })}
                    >
                        <option value="">Elije un rol...</option>
                        <option value="broker">Broker</option>
                        <option value="sub_broker">Sub broker</option>
                    </select>
                    {errors.role && <span className="error">Este campo es requerido</span>}

                    {isSubBroker && (
                        <>
                            <label htmlFor="broker_id">Broker ID</label>
                            <input
                                id="broker_id"
                                type="text"
                                placeholder="Broker ID asociado"
                                {...register("broker_id", { required: isSubBroker })}
                            />
                            {errors.broker_id && <span className="error">Este campo es requerido</span>}
                        </>
                    )}

                    <button type="submit" className="btn" disabled={isDisabled}>
                        Create account
                    </button>
                </form>

                <p className="small">
                   <Link to="/login">Volver</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;