import axios from "axios";

// Configuración compartida por todos los clientes HTTP de la aplicación.
// Centralizar aquí evita duplicar baseURL, headers, timeout y credenciales.
export const API_BASE_URL = import.meta.env.VITE_API_URL;
export const DEFAULT_TIMEOUT = 10000;

export function createHttpClient() {
  return axios.create({
    baseURL: API_BASE_URL,
    headers: { "Content-Type": "application/json" },
    timeout: DEFAULT_TIMEOUT,
    withCredentials: true,
  });
}
