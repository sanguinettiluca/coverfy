import {
    LayoutDashboard, FileText, BarChart2,
    ShieldAlert, Search, Settings, UserPlus,
    FileSearchIcon, FilePlusIcon, FilePenLine, BookUser, UserSearch, UserPen, FileUser, Building2, FileCog,
    Calculator, Pencil
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
    roles?: string[];
};

export const NAV_ITEMS: NavItem[] = [
    { label: "Dashboard", to: "/", icon: <LayoutDashboard size={18} /> },
    { label: "Busqueda", to: "/search", icon: <Search size={18} /> },
    { label: "Registro de Usuario", to: "/register", icon: <FileUser size={18} />, roles: ["ADMIN"] },
    {
        label: "Pólizas",
        icon: <FileText size={18} />,
        roles: ["BROKER", "SUB_BROKER"],
        children: [
            { label: "Buscar Póliza", to: "/policies/search", icon: <FileSearchIcon size={15} /> },
            { label: "Alta de Póliza", to: "/policies/new", icon: <FilePlusIcon size={15} /> },
            { label: "Editar Póliza", to: "/policies/edit", icon: <FilePenLine size={15} /> },
        ],
    },
    {
        label: "Clientes", to: "/clients",
        icon: <BookUser size={18} />,
        roles: ["BROKER", "SUB_BROKER"],
        children: [
            { label: "Buscar Cliente", to: "/clients/search", icon: <UserSearch size={15} /> },
            { label: "Alta de Cliente", to: "/clients/new", icon: <UserPlus size={15} /> },
            { label: "Editar Cliente", to: "/clients/edit", icon: <UserPen size={15} /> },
        ],
    },

    {
        label: "Compañías", to: "/companies",
        icon: <Building2 size={18} />,
        roles: ["BROKER", "SUB_BROKER"],
        children: [
            { label: "Alta Compañía", to: "/companies/new", icon: <Building2 size={15} /> },
            { label: "Alta Cobertura", to: "/coverages", icon: <FileCog size={15} /> },
            { label: "Editar Compañía", to: "/companies/edit", icon: <Pencil size={15} /> },
        ],
    },
    {
        label: "Siniestros",
        icon: <ShieldAlert size={18} />,
        roles: ["BROKER", "SUB_BROKER"],
        children: [
            { label: "Buscar Siniestro", to: "/claims/search", icon: <FileSearchIcon size={15} /> },
            { label: "Nuevo Siniestro", to: "/claims/new", icon: <FilePlusIcon size={15} /> },
            { label: "Editar Siniestro", to: "/claims/edit", icon: <FilePenLine size={15} /> },
        ],
    },
    { label: "Calculadora de comisiones", to: "/comissions", icon: <Calculator size={18} />, roles: ["BROKER", "SUB_BROKER"] },
    { label: "Gráficas", to: "/charts", icon: <BarChart2 size={18} />, roles: ["BROKER", "SUB_BROKER"] },
    { label: "Configuración", to: "/settings", icon: <Settings size={18} /> },
];