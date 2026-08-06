import { useNavigate } from "react-router";
import { SearchX } from "lucide-react";

const NotFound = () => {

    const navigate = useNavigate();

    return (
        <div className="page">
            <div className="login-card notfound-card">
                <div className="notfound-icon">
                    <SearchX size={28} />
                </div>

                <h2 className="notfound-code">404</h2>
                <h1 className="login-title">Página no encontrada</h1>
                <p className="login-sub">
                    La página que buscás no existe o fue movida.
                </p>

                <button className="btn" onClick={() => navigate("/")}>
                    Volver al inicio
                </button>
            </div>
        </div>
    );
};

export default NotFound;