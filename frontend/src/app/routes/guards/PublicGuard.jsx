import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/app/providers/AuthContext";

// Componentes de shadcn
import { Spinner } from "@/components/ui/Spinner";

/**
 * Guard para rutas públicas.
 **/

export default function PublicGuard({ children }) {
  const { isLoggedIn, isLoading } = useAuth();

  // Mostrar spinner mientras se hidrata la sesión.
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  // Si el usuario está autenticado lo redirecciona al dashboard.
  // Esto es para evitar que un usuario autenticado acceda a /auth-login
  if (isLoggedIn) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
