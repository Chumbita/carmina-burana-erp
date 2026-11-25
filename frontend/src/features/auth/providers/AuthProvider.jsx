import { useCallback, useEffect, useState } from "react";

import { AuthContext } from "../context/authContext";
import { authService } from "../services/authService";

/**
 * AuthProvider - Dueño del estado de sesión de la aplicación.
 *
 * Toda la comunicación con el backend pasa por `authService`; el provider
 * solo guarda el usuario en memoria (las cookies las maneja el backend).
 */
export function AuthProvider({ children }) {
  const [authUser, setAuthUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Verificar sesión existente al montar la app
  useEffect(() => {
    const checkSession = async () => {
      try {
        // Si la cookie es válida, el backend retorna los datos del usuario
        const data = await authService.me();
        setAuthUser(data.user);
        setIsLoggedIn(true);
      } catch {
        // No hay sesión válida o cookie expirada
        setAuthUser(null);
        setIsLoggedIn(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  // Escuchar evento de logout forzado desde privateClient (cuando refresh falla)
  useEffect(() => {
    const handleForcedLogout = () => {
      setAuthUser(null);
      setIsLoggedIn(false);
    };

    window.addEventListener("auth:logout", handleForcedLogout);
    return () => window.removeEventListener("auth:logout", handleForcedLogout);
  }, []);

  // Login: almacena datos del usuario en memoria
  const login = useCallback((userData) => {
    setAuthUser(userData);
    setIsLoggedIn(true);
  }, []);

  // Logout: delega el cierre de sesión al backend y resetea el estado local
  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      setAuthUser(null);
      setIsLoggedIn(false);
    }
  }, []);

  const value = {
    authUser,
    isLoggedIn,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
