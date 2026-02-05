import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/app/providers/AuthContext";

// Componentes de shadcn
import { Spinner } from "@/components/ui/Spinner";

/**
 * Guard para proteger rutas privadas.
 **/

export default function AuthGuard({ children }) {
  const { isLoggedIn, isLoading } = useAuth();
  const location = useLocation();

  // Mostrar spinner mientras verifica autenticación
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  // Si el usuario no está autenticado, redirig al login.
  // Guardamos la ruta actual para redirir luego de que el usuario se haya logueado.
  if (!isLoggedIn) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  return children;
}
