// API pública del feature auth.
// Expone solo lo que el resto de la app necesita para evitar imports profundos.
export { default as LoginPage } from "./pages/LoginPage";
export { LoginForm } from "./components/LoginForm";
export { useLoginForm } from "./hooks/useLoginForm";
export { authService } from "./services/authService";
export { LoginSchema } from "./schemas/loginForm.schema";

// Sesión: hook y provider viven en el feature.
export { useAuth } from "./context/authContext";
export { AuthProvider } from "./providers/AuthProvider";
