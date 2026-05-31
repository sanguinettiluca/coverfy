import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { Role } from "../types";

interface RoleGuardProps {
    roles: Role[];
}

export function RoleGuard({roles}: RoleGuardProps){
    const {user} = useAuth();
    if(!user || !roles.includes(user.role)){
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
}