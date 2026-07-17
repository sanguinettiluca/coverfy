import { useSelector } from "react-redux";
import { NAV_ITEMS } from "../constants/NavItems";
import SidebarNavItem from "./SidebarNavItem";
import type { RootState } from "../../store/store"; 

type SidebarNavProps = {
    expanded: string | null;
    onToggle: (label: string) => void;
};

const SidebarNav = ({ expanded, onToggle }: SidebarNavProps) => {
    const role = useSelector((state: RootState) => state.user.user?.role) ?? "";

    const items = NAV_ITEMS.filter((item) => !item.roles || item.roles.includes(role));

    return (
        <nav className="sidebar-nav">
            {items.map((item) => (
                <SidebarNavItem
                    key={item.label}
                    item={item}
                    isExpanded={expanded === item.label}
                    onToggle={onToggle}
                />
            ))}
        </nav>
    );
};

export default SidebarNav;