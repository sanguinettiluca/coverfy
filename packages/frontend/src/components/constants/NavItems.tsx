import {
    LayoutDashboard, FileText, BarChart2, List,
    Bell, Search, Settings, UserPlus,
    FileSearchIcon, FilePlusIcon, FilePenLine, BookUser, UserSearch, UserPen, FileUser
} from "lucide-react";

export type NavChild = {
    label: string;
    to: string;
    icon?: React.ReactNode;
};

export type NavItem = {
    label: string;
    to?: string;
    icon: React.ReactNode;
    children?: NavChild[];
};

export const NAV_ITEMS: NavItem[] = [
    { label: "Dashboard", to: "/dashboard", icon: <LayoutDashboard size={18} /> },
    { label: "Registro de Usuario", to: "/register", icon: <FileUser size={18} /> },
    {
        label: "Pólizas",
        icon: <FileText size={18} />,
        children: [
            { label: "Buscar Póliza", to: "/policies/search", icon: <FileSearchIcon size={15} /> },
            { label: "Alta de Póliza", to: "/policies/new", icon: <FilePlusIcon size={15} /> },
            { label: "Editar Póliza", to: "/policies/edit", icon: <FilePenLine size={15} /> },
        ],
    },
     {
        label: "Clientes", to: "/clients",
        icon: <BookUser size={18} />,
        children: [
            { label: "Buscar Cliente", to: "/policies/search", icon: <UserSearch size={15} /> },
            { label: "Alta de Cliente", to: "/policies/new", icon: <UserPlus size={15} /> },
            { label: "Editar Cliente", to: "/policies/edit", icon: <UserPen size={15} /> },
        ],
    },
    { label: "Reportes", to: "/reports", icon: <BarChart2 size={18} /> },
    { label: "Listas", to: "/lists", icon: <List size={18} /> },
    { label: "Alertas", to: "/alerts", icon: <Bell size={18} /> },
    { label: "Busqueda", to: "/search", icon: <Search size={18} /> },
    { label: "Configuración", to: "/settings", icon: <Settings size={18} /> },
];