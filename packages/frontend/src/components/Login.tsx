import { useState } from "react";
import { useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import {useNavigate } from "react-router";
import api from "../data/api"
import { toast } from "react-toastify";
import { loguear } from "../features/user.slice";


const Login = () => {

    type LoginForm = {
        username: string;
        password: string;
    };

    type TwoFactorForm = {
        code: string;
    };

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { register, handleSubmit, watch, formState: { errors } } = useForm<LoginForm>();

    const {
        register: registerCode,
        handleSubmit: handleSubmitCode,
        formState: { errors: codeErrors }
    } = useForm<TwoFactorForm>();

    const username = watch("username");
    const password = watch("password");

    const isDisabled = !username || !password;

    const [preAuthToken, setPreAuthToken] = useState<string | null>(null);
    const [verificando, setVerificando] = useState(false);

    const handleLoginExitoso = (data: { accessToken: string; user: any }) => {
        localStorage.setItem("token", data.accessToken);
        dispatch(loguear(data.user));
        navigate("/");
    };

    const onSubmit = (data: LoginForm) => {
        api.post("/auth/login", {
            email: data.username,
            password: data.password
        }).then(response => {
            const body = response.data;

            if (body.accessToken) {
                handleLoginExitoso(body);
                return;
            }

            if (body.twoFactorRequired && body.preAuthToken) {
                setPreAuthToken(body.preAuthToken);
                return;
            }

            toast.error(body.message ?? "No se pudo iniciar sesión");

        }).catch(error => {
            if (error.response) {
                toast.error(error.response.data.message);
            } else {
                console.error("Error de conexión:", error.message);
            }
        });
    }

    const onSubmitCode = (data: TwoFactorForm) => {
        if (!preAuthToken) return;

        setVerificando(true);
        api.post("/auth/login/verify-2fa", {
            preAuthToken,
            code: data.code
        }).then(response => {
            if (response.data.accessToken) {
                handleLoginExitoso(response.data);
            } else {
                toast.error("No se pudo verificar el código");
            }
        }).catch(error => {
            if (error.response) {
                toast.error(error.response.data.message);
            } else {
                console.error("Error de conexión:", error.message);
            }
        }).finally(() => setVerificando(false));
    };

    if (preAuthToken) {
        return (
            <div className="page" key="2fa-step">
                <div className="login-card">
                    <div className="brand-header">
                        <h2 className="brand">Coverfy</h2>
                        <p className="brand-sub">Broker Management</p>
                    </div>

                    <h1 className="login-title">Verificación en dos pasos</h1>
                    <p className="login-sub">Ingresá el código de tu app, o un código de respaldo si perdiste el acceso</p>

                    <form className="login-form" onSubmit={handleSubmitCode(onSubmitCode)} autoComplete="off">
                        <label htmlFor="code">Código</label>
                        <input
                            key="2fa-code-input"
                            id="code"
                            type="text"
                            placeholder="Código de 6 dígitos o de respaldo"
                            autoFocus
                            autoComplete="off"
                            {...registerCode("code", { required: true })}
                        />
                        {codeErrors.code && <span className="error">Ingresá tu código</span>}

                        <button type="submit" className="btn" disabled={verificando}>
                            {verificando ? "Verificando..." : "VERIFICAR"}
                        </button>
                    </form>

                    <p className="small">
                        <button
                            type="button"
                            className="link-button"
                            onClick={() => setPreAuthToken(null)}
                        >
                            Volver al login
                        </button>
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="page" key="login-step">
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
                        key="login-username-input"
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

            </div>
        </div>
    );
}
export default Login