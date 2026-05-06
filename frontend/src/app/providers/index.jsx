// Componente que centraliza todos los providers de la aplicación.
import { AuthProvider } from "./AuthContext";
import { NotificationProvider } from "@/components/shared/notifications/NotificationContext";
import { NotificationContainer } from "@/components/shared/notifications/NotificationContainer";

export function AppProviders({ children }) {
  return (
    <AuthProvider>
      <NotificationProvider>
        {children}
        <NotificationContainer />
      </NotificationProvider>
    </AuthProvider>
  );
}
