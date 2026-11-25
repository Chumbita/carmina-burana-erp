import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";

import { PasswordInput } from "./PasswordInput";
import { useLoginForm } from "../hooks/useLoginForm";

/**
 * LoginForm - Contenedor del formulario de login.
 *
 * Toda la lógica vive en `useLoginForm`; este componente solo compone la
 * presentación (campos, error y submit).
 */
export function LoginForm() {
  const {
    register,
    errors,
    isValid,
    error,
    loading,
    showPassword,
    togglePassword,
    submit,
  } = useLoginForm();

  return (
    <form className="w-full max-w-md" onSubmit={submit} noValidate>
      <FieldSet>
        <FieldGroup>
          <Field data-invalid={Boolean(errors.username)}>
            <FieldLabel htmlFor="username">Nombre de usuario</FieldLabel>
            <Input
              id="username"
              type="text"
              placeholder="carlosolari"
              aria-invalid={Boolean(errors.username)}
              {...register("username")}
            />
          </Field>
          <Field data-invalid={Boolean(errors.password)}>
            <FieldLabel htmlFor="password">Contraseña</FieldLabel>
            <PasswordInput
              id="password"
              placeholder="••••••••"
              invalid={Boolean(errors.password)}
              visible={showPassword}
              onToggleVisibility={togglePassword}
              {...register("password")}
            />
          </Field>
          {error && (
            <FieldDescription className="text-sm text-red-500">
              {error}
            </FieldDescription>
          )}
          <Field>
            <Button
              type="submit"
              size="lg"
              className="cursor-pointer"
              variant={loading ? "outline" : ""}
              disabled={loading || !isValid}
            >
              {loading && <Spinner />}
              Iniciar sesión
            </Button>
          </Field>
        </FieldGroup>
      </FieldSet>
    </form>
  );
}
