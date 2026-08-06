import { LogOut } from "lucide-react";
import { useDispatch } from "react-redux";
import { desloguear } from "../../features/user.slice";
import { useNavigate } from "react-router";
import api from "../../data/api"; 


const SidebarFooter = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = () => {
        api.post("/auth/logout")
            .catch(() => {

            })
            .finally(() => {
                localStorage.removeItem("token");
                dispatch(desloguear());
                navigate("/login");
            });
    };

    return (
        <div className="sidebar-footer">
            <button className="sidebar-link sidebar-logout" onClick={handleLogout}>
                <span className="sidebar-icon">
                    <LogOut size={18} />
                </span>
                <span>Cerrar Sesión</span>
            </button>
        </div>
    );
};

export default SidebarFooter;