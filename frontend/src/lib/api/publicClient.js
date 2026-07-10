import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL;

// Cliente HTTP público para realizar peticiones que no requieran token
const publicClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
  withCredentials: true,
});

export default publicClient;
