import api from "./api";

interface CrearUsuarioInput {
    nombre: string;
    email: string;
    password: string;
    role: "BROKER" | "SUB_BROKER";
}

export async function crearUsuario(input: CrearUsuarioInput) {
    const { data } = await api.post("/auth/users", input);
    return data;
}