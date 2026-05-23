import { NAV_ITEMS } from "../constants/NavItems";
import SidebarNavItem from "./SidebarNavItem";

type SidebarNavProps = {
    expanded: string | null;
    onToggle: (label: string) => void;
};

const SidebarNav = ({ expanded, onToggle }: SidebarNavProps) => (
    <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => (
            <SidebarNavItem
                key={item.label}
                item={item}
                isExpanded={expanded === item.label}
                onToggle={onToggle}
            />
        ))}
    </nav>
);

export default SidebarNav;