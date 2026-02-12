import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL;

// Cliente HTTP reutilizable
// Cliente público para realizar peticiones que no requieran incluir el token
const publicCliente = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
});

export default publicCliente;
