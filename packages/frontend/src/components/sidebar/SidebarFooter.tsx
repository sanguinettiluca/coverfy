import { LogOut } from "lucide-react";
 
type SidebarFooterProps = {
    onLogout: () => void;
};
 
const SidebarFooter = ({ onLogout }: SidebarFooterProps) => (
    <div className="sidebar-footer">
        <button className="sidebar-link sidebar-logout" onClick={onLogout}>
            <span className="sidebar-icon">
                <LogOut size={18} />
            </span>
            <span>Cerrar Sesión</span>
        </button>
    </div>
);
 
export default SidebarFooter;