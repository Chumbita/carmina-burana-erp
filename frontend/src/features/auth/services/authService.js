import publicClient from "@/lib/api/publicClient";
import privateClient from "@/lib/api/privateClient";
import { ENDPOINTS } from "@/lib/api/endpoints";

export const authService = {
  login: async (username, password) => {
    try {
      const response = await publicClient.post(ENDPOINTS.AUTH.LOGIN, {
        username,
        password,
      });

      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error("Usuario y/o contraseña incorrectas.");
      }
      throw new Error("Error de conexión con el servidor.");
    }
  },

  logout: async () => {
    try {
      await privateClient.post(ENDPOINTS.AUTH.LOGOUT);
    } catch {
      // Si falla, el AuthContext se encargará de limpiar el estado
    }
  },
};
