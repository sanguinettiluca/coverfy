import { useNavigate } from "react-router";

const NotFound = () => {

    const navigate = useNavigate();

    return(
        <div className="page">
            <aside className="login-wrapper">
                <div className="login-card">
                    <h2 className="brand">404</h2>
                    <p className="notfound-text">
                        La página que buscas no existe o fue movida.
                    </p>
                    <button className="btn" onClick={() => navigate("/login")}>
                        Volver al inicio
                    </button>
                </div>
            </aside>
            <main className="welcome">
                <div className="welcome-overlay">
                    <div className="welcome-text">
                        <h1>Oops...</h1>
                        <p>Parece que te perdiste.</p>
                    </div>
                </div>
            </main>
        </div>

    )
}

export default NotFound