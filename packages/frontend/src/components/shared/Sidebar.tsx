import {NavLink} from 'react-router-dom';
import {Users, FileText, AlertTriangle, LayoutDashboard} from 'lucide-react'; // ICONOS
import {useAuth} from '@/context/AuthContext';
import {cn} from '@/lib/utils';

interface NavItem{
    label: string;
    href: string;
    icon: React.ReactNode;
}

const brokerNav: NavItem[] = [
    { label: "Clientes", href: "/clientes", icon: <Users className="h-4 w-4" /> },
    { label: "Siniestros", href: "/siniestros", icon: <AlertTriangle className="h-4 w-4" /> }
];

const adminNav: NavItem[] = [
    { label: "Usuarios", href: "/admin/usuarios", icon: <LayoutDashboard className="h-4 w-4" /> }
];

export function Sidebar(){
    const {user} = useAuth();
    const navItems = user?.role === 'ADMIN' ? adminNav : brokerNav;

    return (
        <aside className="w-60 h-full bg-primary flex flex-col shrink-0">
            <div className="px-6 py-5 border-b border-primary-foreground/10">
                <h1 className="text-xl font-bold text-primary-foreground tracking-tight">
                    Coverfy
                </h1>
                <p className="text-xs text-primary-foreground/50 mt-0.5">
                    Panel de gestión
                </p>
            </div>

            <nav className="flex-1 px-3 py-4 space-y-1">
                {navItems.map((item) => (
                    <NavLink key={item.href} to={item.href} className={({isActive}) =>
                        cn(
                            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                            isActive ? "bg-secondary text-secondary-foreground" : "text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground"
                        )
                        }>
                        {item.icon}
                        {item.label}
                    </NavLink>
                ))}
            </nav>

            <div className="px-4 py-4 border-t border-primary-foreground/10">
                <p className="text-xs text-primary-foreground/50 truncate">{user?.email}</p>
                <p className="text-xs font-medium text-primary-foreground/80 truncate">{user?.nombre}</p>
            </div>

        </aside>
    );
}