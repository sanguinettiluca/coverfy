import axios from "axios";

declare module "axios" {
  export interface InternalAxiosRequestConfig {
    skipAuth?: boolean;
  }
}

const api = axios.create({
  baseURL: "http://localhost:3000/api",
});

api.interceptors.request.use((config) => {
  config.headers["Content-Type"] = "application/json";
  
  if(config.skipAuth) {
    return config;
  }

  config.headers["Authorization"] = `Bearer ${localStorage.getItem("token")}`;
  return config;
});

export default api;