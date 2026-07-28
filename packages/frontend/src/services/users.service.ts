import api from "./api";

interface CreateUserInput {
    name: string;
    email: string;
    password: string;
    role: "BROKER" | "SUB_BROKER";
}

export async function createUser(input: CreateUserInput) {
    const { data } = await api.post("/auth/users", input);
    return data;
}
