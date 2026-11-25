import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { ChangePasswordSchema } from "../schemas/changePasswordForm.schema";
import { getPasswordRequirements } from "../utils/passwordRequirements";
import { useChangePassword } from "./useChangePassword";

const INITIAL_VISIBILITY = {
  currentPassword: false,
  newPassword: false,
  confirmPassword: false,
};

/**
 * useChangePasswordForm - Estado y comportamiento del formulario de cambio
 * de contraseña: validación (Zod + RHF), visibilidad de cada campo,
 * requisitos en vivo y envío al caso de uso.
 *
 * El componente consumidor queda como presentación pura.
 */
export function useChangePasswordForm() {
  const { changePassword, loading, error, success } = useChangePassword();

  const {
    register,
    watch,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(ChangePasswordSchema),
    mode: "onBlur",
  });

  const [visibleFields, setVisibleFields] = useState(INITIAL_VISIBILITY);

  const newPassword = watch("newPassword") || "";
  const requirements = getPasswordRequirements(newPassword);

  const toggleVisibility = (field) =>
    setVisibleFields((prev) => ({ ...prev, [field]: !prev[field] }));

  const submit = handleSubmit((data) =>
    changePassword(data.currentPassword, data.newPassword),
  );

  return {
    register,
    errors,
    isValid,
    requirements,
    visibleFields,
    toggleVisibility,
    submit,
    loading,
    error,
    success,
  };
}
