import React, { useState, useEffect, useContext, useCallback } from "react";
import privateClient from "@/lib/api/privateClient";
import { ENDPOINTS } from "@/lib/api/endpoints";

const AuthContext = React.createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [authUser, setAuthUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Verificar sesión existente al montar la app
  useEffect(() => {
    const checkSession = async () => {
      try {
        // Intentar obtener datos del usuario con la cookie existente
        // Si la cookie es válida, el backend retornará los datos del usuario
        const response = await privateClient.get(ENDPOINTS.AUTH.ME);
        setAuthUser(response.data.user);
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
  // Las cookies (access_token, refresh_token) las maneja el backend automáticamente
  const login = useCallback((userData) => {
    setAuthUser(userData);
    setIsLoggedIn(true);
  }, []);

  // Logout: llama al backend para limpiar cookies y resetea estado local
  const logout = useCallback(async () => {
    try {
      await privateClient.post(ENDPOINTS.AUTH.LOGOUT);
    } catch {
      // Si falla, limpiar estado de todas formas
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
