import { Field, FieldDescription } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";

import { useAuth } from "@/features/auth";

import { PasswordField } from "./PasswordField";
import { PasswordRequirements } from "./PasswordRequirements";
import { ChangePasswordFeedback } from "./ChangePasswordFeedback";
import { useChangePasswordForm } from "../hooks/useChangePasswordForm";

/**
 * ChangePasswordForm - Contenedor del formulario de cambio de contraseña.
 *
 * Toda la lógica vive en `useChangePasswordForm`; este componente compone
 * los subcomponentes de presentación y cierra la sesión al completar.
 */
export default function ChangePasswordForm() {
  const { logout } = useAuth();
  const {
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
  } = useChangePasswordForm();

  return (
    <form onSubmit={submit}>
      <Field className="max-w-sm">
        <FieldDescription>
          La contraseña debe tener al menos 6 caracteres e incluir una
          combinación de números, letras y caracteres especiales (!$@%).
        </FieldDescription>

        <PasswordField
          id="current-password"
          label="Contraseña actual"
          invalid={Boolean(errors.currentPassword)}
          visible={visibleFields.currentPassword}
          onToggleVisibility={() => toggleVisibility("currentPassword")}
          autoComplete="current-password"
          {...register("currentPassword")}
        />

        <PasswordField
          id="new-password"
          label="Nueva contraseña"
          invalid={Boolean(errors.newPassword)}
          visible={visibleFields.newPassword}
          onToggleVisibility={() => toggleVisibility("newPassword")}
          autoComplete="new-password"
          {...register("newPassword")}
        />

        <PasswordRequirements requirements={requirements} />

        <PasswordField
          id="repeat-new-password"
          label="Repetir contraseña"
          invalid={Boolean(errors.confirmPassword)}
          visible={visibleFields.confirmPassword}
          onToggleVisibility={() => toggleVisibility("confirmPassword")}
          autoComplete="new-password"
          errorMessage={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />

        <ChangePasswordFeedback error={error} success={success} onSuccess={logout}>
          <Button
            type="submit"
            className="cursor-pointer"
            variant={loading ? "outline" : ""}
            disabled={loading || !isValid}
          >
            {loading && <Spinner />}
            Continuar
          </Button>
        </ChangePasswordFeedback>
      </Field>
    </form>
  );
}
