import { createContext, useContext } from "react";

/**
 * Contexto de sesión del feature auth.
 * Mantiene en memoria el usuario autenticado y expone login/logout.
 */
export const AuthContext = createContext(null);

/**
 * Hook de acceso al contexto de sesión.
 * Debe consumirse dentro de <AuthProvider />.
 */
export function useAuth() {
  return useContext(AuthContext);
}
