import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:3000/api"
});

// Agregar el token en cada request
api.interceptors.response.use(
    (res)=> res,
    (error) => {
        if(error.response?.status === 401){
            localStorage.removeItem("token");
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

export default api;