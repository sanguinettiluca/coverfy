import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import { RoleGuard } from "./RoleGuard";
import { AppLayout } from "../layouts/AppLayout";
import { LoginPage } from "../pages/LoginPage";
import { useAuth } from "../context/AuthContext";

export function AppRouter(){
    const {user} = useAuth();

    // Redirección inicial según rol
    const defaultRoute = user ?.role === "ADMIN" ? "/admin/usuarios" : "/clientes";

    return (

        <BrowserRouter>

            <Routes>
                <Route path="/login" element={<LoginPage />} />

                {/* Rutas protegidas: */}
                <Route element={<ProtectedRoute />}>
                    <Route element={<AppLayout />}>
                        <Route path="/" element={<Navigate to={defaultRoute} replace />} />

                        {/* SOLO PARA ADMINS: */}
                        <Route element={<RoleGuard roles={["ADMIN"]} />}>
                            <Route path="/admin/usuarios" element={<div>Usuarios:</div>} />
                        </Route>

                        {/* BROKER Y SUB_BROKER: */}
                        <Route element={<RoleGuard roles={["BROKER", "SUB_BROKER"]} />}>
                            <Route path="/clientes" element={<div>Clientes</div>} />
                            <Route path="/clientes/:id" element={<div>Detalle Cliente</div>} />
                            <Route path="/siniestros" element={<div>Siniestros</div>} />
                        </Route>
                    </Route>
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />

            </Routes>    
        
        </BrowserRouter>

    );
}