// Componente que centraliza todos los providers de la aplicación.
import { AuthProvider } from "./AuthContext";

export function AppProviders({ children }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}
