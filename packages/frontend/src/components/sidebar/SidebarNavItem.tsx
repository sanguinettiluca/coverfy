import { NavLink } from "react-router";
import { ChevronDown } from "lucide-react";
import type { NavItem } from "../constants/NavItems";

type SidebarNavItemProps = {
    item: NavItem;
    isExpanded: boolean;
    onToggle: (label: string) => void;
};

const SidebarNavItem = ({ item, isExpanded, onToggle }: SidebarNavItemProps) => {
    if (item.children) {
        return (
            <div>
                <button
                    className={`sidebar-link sidebar-link--expandable ${isExpanded ? "sidebar-link--active" : ""}`}
                    onClick={() => onToggle(item.label)}
                >
                    <span className="sidebar-icon">{item.icon}</span>
                    <span>{item.label}</span>
                    <ChevronDown
                        size={14}
                        className={`sidebar-chevron ${isExpanded ? "sidebar-chevron--open" : ""}`}
                    />
                </button>
                {isExpanded && (
                    <div className="sidebar-children">
                        {item.children.map((child) => (
                            <NavLink
                                key={child.to}
                                to={child.to}
                                className={({ isActive }) =>
                                    `sidebar-child-link ${isActive ? "sidebar-child-link--active" : ""}`
                                }
                            >
                                {child.icon && (
                                    <span className="sidebar-icon">{child.icon}</span>
                                )}
                                <span>{child.label}</span>
                            </NavLink>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    return (
        <NavLink
            to={item.to!}
            className={({ isActive }) =>
                `sidebar-link ${isActive ? "sidebar-link--active" : ""}`
            }
        >
            <span className="sidebar-icon">{item.icon}</span>
            <span>{item.label}</span>
        </NavLink>
    );
};

export default SidebarNavItem;