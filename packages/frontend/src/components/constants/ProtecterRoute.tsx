import { Navigate, Outlet } from "react-router";
import { useSelector } from "react-redux";
import type { RootState } from "../../store/store"; 

type Role = "ADMIN" | "BROKER" | "SUB_BROKER";

type Props = {
    allowedRoles: Role[];
};

const RoleRoute = ({ allowedRoles }: Props) => {
    const user = useSelector((state: RootState) => state.user.user);

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (!allowedRoles.includes(user.role)) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default RoleRoute;