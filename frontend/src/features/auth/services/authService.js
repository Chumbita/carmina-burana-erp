import publicCliente from "@/lib/api/publicClient";
import { ENDPOINTS } from "@/lib/api/endpoints";

export const authService = {
  login: async (username, password) => {
    try {
      const response = await publicCliente.post(ENDPOINTS.AUTH.LOGIN, {
        username,
        password,
      });

      const { access_token, token_type, user } = response.data;

      // Guardamos en el local storage
      localStorage.setItem("access_token", access_token);
      localStorage.setItem("user", JSON.stringify(user));

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
