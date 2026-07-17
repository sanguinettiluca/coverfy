import { useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import api from "../data/api"
import { toast } from "react-toastify";
import { loguear } from "../features/user.slice";


const Login = () => {


    type LoginForm = {
        username: string;
        password: string;
    };

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { register, handleSubmit, watch, formState: { errors } } = useForm<LoginForm>();;

    const username = watch("username");
    const password = watch("password");

    const isDisabled = !username || !password;

    const onSubmit = (data: LoginForm) => {
        console.log(data);
        api.post("/auth/login", {
            email: data.username,
            password: data.password
        }).then(response => {
            if (response.data.accessToken) {
                localStorage.setItem("token", response.data.accessToken);
                dispatch(loguear(response.data.user));
                console.log("Navegando...");
                navigate("/");
            } else { console.log(response.data.message); }

        }).catch(error => {
            if (error.response) {
                toast.error(error.response.data.message);
            } else {
                console.error("Error de conexión:", error.message);
            }
        });
    }

    return (
        <div className="page">
            <div className="login-card">
                <div className="brand-header">
                    <h2 className="brand">Coverfy</h2>

                    <p className="brand-sub">Broker Management</p>
                </div>

                <h1 className="login-title">Entrar</h1>
                <p className="login-sub">Ingresa con tus credenciales</p>

                <form className="login-form" autoComplete="on" onSubmit={handleSubmit(onSubmit)}>

                    <label htmlFor="username">Usuario</label>
                    <input
                        id="username"
                        type="text"
                        placeholder="Tu usuario"
                        {...register("username", { required: true })}
                    />
                    {errors.username && <span className="error">Este campo es requerido</span>}

                    <label htmlFor="pass">Contraseña</label>
                    <input
                        id="pass"
                        type="password"
                        placeholder="••••••••"
                        {...register("password", { required: true })}
                    />
                    {errors.password && <span className="error">Este campo es requerido</span>}

                    <button type="submit" className="btn" disabled={isDisabled}>
                        ENTRAR
                    </button>
                </form>

                <p className="small">
                    Tienes algún problema? <Link to="/login">Contactate
                    </Link>
                </p>
            </div>
        </div>

    )
}
export default Login