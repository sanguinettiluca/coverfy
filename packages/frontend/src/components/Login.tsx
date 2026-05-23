import { useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";


const Login = () => {


    type LoginForm = {
        username: string;
        password: string;
    };

    //const dispatch = useDispatch();
    //const navigate = useNavigate();
    const { register, handleSubmit, watch, formState: { errors } } = useForm<LoginForm>();;

    const username = watch("username");
    const password = watch("password");

    const isDisabled = !username || !password;

    const onSubmit = (data: LoginForm) => {

        console.log(data);
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