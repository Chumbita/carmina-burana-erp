import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL;

// Cliente HTTP reutilizable
const privateClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
});

// Interceptor para agregar el token en todas las peticiones
privateClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejar errores globales
privateClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Manejo de error cuando el token está expirado
      localStorage.removeItem("access_token");
      window.location.href = "/auth/login"; // -> Redireccionar al usuario al login
    }
    return Promise.reject(error);
  }
);

export default privateClient;
