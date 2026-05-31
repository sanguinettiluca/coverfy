import {createContext, useContext, useState, useCallback, type ReactNode} from "react";
import type {User} from "../types";
import {logout as logoutService} from "../services/auth.service";

// Define la interfaz para el contexto de autenticación
interface AuthContextValue{
    user: User | null;
    token: string | null;
    login: (user: User, token: string) => void; // Método para iniciar sesión
    logout: () => Promise<void>; // Método para cerrar sesión
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({children}: {children: ReactNode}){
    const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
    const [user, setUser] = useState<User | null>(() => {
        const stored = localStorage.getItem("user");
        return stored ? JSON.parse(stored) : null;
    });

    const login = useCallback((userData: User, userToken: string) => {
        setUser(userData);
        setToken(userToken);
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("token", userToken);
    }, []); // El [] asegura que la función no se vuelva a crear en cada render

    const logout = useCallback(async () => {
        try{
            await logoutService();
        }finally{ // Aseguramos que el estado se limpie incluso si la petición falla
            setUser(null);
            setToken(null);
            localStorage.removeItem("token");
            localStorage.removeItem("user");
        }
    }, []);

    return (
        <AuthContext.Provider value={{user, token, login, logout, isAuthenticated: !!token}}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(){
    const context = useContext(AuthContext);
    if(!context){
        throw new Error("useAuth debe usarse dentro de AuthProvider");
    }
    return context;
}