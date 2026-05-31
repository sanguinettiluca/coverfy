import {Navigate, Outlet} from 'react-router-dom';
import {useAuth} from '../context/AuthContext';

export function ProtectedRoute(){
    const {isAuthenticated} = useAuth();
    // replace sirve para que al hacer login no se pueda volver a la pagina protegida
    return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}