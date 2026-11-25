import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useLocation } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";

import { LoginSchema } from "../schemas/loginForm.schema";
import { authService } from "../services/authService";
import { useAuth } from "../context/authContext";

const DEFAULT_REDIRECT = "/dashboard";

/**
 * useLoginForm - Encapsula toda la lógica del flujo de login:
 * estado del formulario, validación, submit, autenticación y navegación.
 *
 * El componente que lo consume queda como presentación pura: solo recibe
 * handlers y estado, no conoce servicios ni router.
 */
export function useLoginForm() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || DEFAULT_REDIRECT;

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({ resolver: zodResolver(LoginSchema) });

  const submit = handleSubmit(async (data) => {
    try {
      setError("");
      setLoading(true);

      // Login: el backend guarda las cookies HttpOnly automáticamente
      const response = await authService.login(data.username, data.password);

      // Almacenar solo los datos del usuario en memoria (no el token)
      login(response.user);

      // Navegar a la ruta original o al dashboard
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  });

  const togglePassword = () => setShowPassword((prev) => !prev);

  return {
    register,
    errors,
    isValid,
    error,
    loading,
    showPassword,
    togglePassword,
    submit,
  };
}
