import { Link } from "react-router";
import {
    FileSearch,
    FilePlus,
    FilePen,
    UserPlus,
    UserSearch,
    UserPen,
    UserCog,
    Settings as SettingsIcon,
} from "lucide-react";
import PolicyStatusCounters from "./PolicyStatusCounters";
import UpcomingPolicies from "./UpcomingPolicies";
import RecentClients from "./RecentClient";
import RecentPolicies from "./RecenPolicies";
import PartnerCompanies from "./PartnerCompanies";

type DashboardCard = {
    to: string;
    title: string;
    desc: string;
    icon: React.ReactNode;
    color: "blue" | "green" | "yellow" | "gray";
};

type DashboardSection = {
    title: string;
    cards: DashboardCard[];
};

const sections: DashboardSection[] = [
    {
        title: "Pólizas",
        cards: [
            { to: "/policies/new", title: "Nueva póliza", desc: "Cargar una póliza para un cliente", icon: <FilePlus size={20} />, color: "blue" },
            { to: "/policies/search", title: "Buscar póliza", desc: "Consultar una póliza existente", icon: <FileSearch size={20} />, color: "green" },
            { to: "/policies/edit", title: "Editar póliza", desc: "Modificar datos de una póliza", icon: <FilePen size={20} />, color: "yellow" },
        ],
    },
    {
        title: "Clientes",
        cards: [
            { to: "/clients/new", title: "Nuevo cliente", desc: "Registrar un cliente en tu cartera", icon: <UserPlus size={20} />, color: "blue" },
            { to: "/clients/search", title: "Buscar cliente", desc: "Consultar datos y pólizas de un cliente", icon: <UserSearch size={20} />, color: "green" },
            { to: "/clients/edit", title: "Editar cliente", desc: "Modificar datos de un cliente", icon: <UserPen size={20} />, color: "yellow" },
        ],
    },
    {
        title: "Sistema",
        cards: [
            { to: "/register", title: "Nuevo usuario", desc: "Crear un broker o sub broker", icon: <UserCog size={20} />, color: "gray" },
            { to: "/settings", title: "Configuración", desc: "Preferencias de la aplicación", icon: <SettingsIcon size={20} />, color: "gray" },
        ],
    },
];

const Dashboard = () => {
    return (
        <div className="dashboard-page">

            <div className="dashboard-header">
                <h1 className="dashboard-title">Dashboard</h1>
                <p className="dashboard-sub">Resumen de tu cartera y accesos rápidos</p>
            </div>

            <PolicyStatusCounters />

            <div className="dashboard-widgets-grid">
                <RecentClients />
                <RecentPolicies />
                <UpcomingPolicies />
                <PartnerCompanies />
            </div>

            {sections.map((section) => (
                <div className="dashboard-section" key={section.title}>
                    <div className="dashboard-section-title">{section.title}</div>
                    <div className="dashboard-grid">
                        {section.cards.map((card) => (
                            <Link to={card.to} className="dashboard-card" key={card.to}>
                                <div className={`dashboard-card-icon dashboard-card-icon--${card.color}`}>
                                    {card.icon}
                                </div>
                                <div className="dashboard-card-body">
                                    <span className="dashboard-card-title">{card.title}</span>
                                    <span className="dashboard-card-desc">{card.desc}</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            ))}

        </div>
    );
};

export default Dashboard;