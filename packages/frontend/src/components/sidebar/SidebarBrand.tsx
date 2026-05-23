import { Shield } from "lucide-react";

const SidebarBrand = () => (
    <div className="sidebar-brand">
        <div className="sidebar-logo">
            <Shield size={18} color="#fff" />
        </div>
        <div>
            <p className="sidebar-brand-name">Coverfy</p>
            <p className="sidebar-brand-sub">Broker Management</p>
        </div>
    </div>
);

export default SidebarBrand;