import publicCliente from "@/lib/api/publicClient";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { useAuth } from "@/app/providers/AuthContext";

export const authService = {
  login: async (username, password) => {
    try {
      const response = await publicCliente.post(ENDPOINTS.AUTH.LOGIN, {
        username,
        password,
      });

      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        // Manejo de errores cuando las credenciales son incorrectas.
        throw new Error("Usuario y/o contraseña incorrectas.");
      }
      // Manejo de cualquier otro tipo de error.
      throw new Error("Error de conexión con el servidor.");
    }
  },

  // logout
};
