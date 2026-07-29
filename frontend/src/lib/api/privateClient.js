import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL;

// Cliente HTTP reutilizable para peticiones autenticadas
const privateClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
  withCredentials: true,
});

// Flag para evitar múltiples intentos de refresh simultáneos
let isRefreshing = false;
// Cola de peticiones pendientes mientras se refresca el token
let failedQueue = [];

const processQueue = (error) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

// Interceptor de respuesta: maneja 401 e intenta refresh automático
privateClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si no es 401 o ya se reintentó, rechazar directamente
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Si ya se está refrescando, agregar a la cola
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then(() => privateClient(originalRequest))
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      // Intentar refresh del token
      await axios.post(
        `${API_BASE_URL}/auth/refresh`,
        {},
        { withCredentials: true }
      );

      // Refresh exitoso, reintentar la petición original
      processQueue(null);
      return privateClient(originalRequest);
    } catch (refreshError) {
      // Refresh falló, limpiar estado y redirigir a login
      processQueue(refreshError);

      // Disparar evento para que AuthContext limpie el estado
      window.dispatchEvent(new Event("auth:logout"));

      // Redirigir al login (solo si no ya estamos en login)
      if (!window.location.pathname.includes("/auth/login")) {
        window.location.href = "/auth/login";
      }

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default privateClient;
