import axios from "axios";

declare module "axios" {
  export interface InternalAxiosRequestConfig {
    skipAuth?: boolean;
  }
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
});

api.interceptors.request.use((config) => {
    if (!(config.data instanceof FormData)) {
        config.headers["Content-Type"] = "application/json";
    }

    if (!config.skipAuth) {
        config.headers["Authorization"] = `Bearer ${localStorage.getItem("token")}`;
    }

    return config;
});

export default api;