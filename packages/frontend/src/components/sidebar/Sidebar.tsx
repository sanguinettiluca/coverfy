import { useState } from "react";
import { useNavigate, useLocation } from "react-router";
import SidebarBrand from "./SidebarBrand";
import SidebarNav from "./SidebarNav.tsx";
import SidebarFooter from "./SidebarFooter.tsx";

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [expanded, setExpanded] = useState<string | null>(
        location.pathname.startsWith("/policies") ? "Pólizas" : null
    );

    const handleToggle = (label: string) => {
        setExpanded((prev) => (prev === label ? null : label));
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    return (
        <aside className="sidebar">
            <SidebarBrand />
            <SidebarNav expanded={expanded} onToggle={handleToggle} />
            <SidebarFooter onLogout={handleLogout} />
        </aside>
    );
};

export default Sidebar;