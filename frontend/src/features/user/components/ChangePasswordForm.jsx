import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChangePasswordSchema } from "../schemas/changePasswordForm.schema";
import { useChangePassword } from "../hooks/useChangePassword";
import { useAuth } from "@/app/providers/AuthContext";

// Componentes shadcn
import {
  Field,
  FieldDescription,
  FieldLabel,
  FieldGroup,
} from "@/components/ui/Field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/InputGroup";
import { Checkbox } from "@/components/ui/Checkbox";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogMedia,
} from "@/components/ui/AlertDialog";

// Iconos
import { CheckCircle, EyeOffIcon } from "lucide-react";
import { EyeIcon } from "lucide-react";
import { Check } from "lucide-react";

export default function ChangePasswordForm() {
  const { changePassword, loading, error, success } = useChangePassword();
  const { logout } = useAuth();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const {
    register,
    watch,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(ChangePasswordSchema),
    mode: "onBlur",
  });
  const newPassword = watch("newPassword") || "";

  const newPasswordValidation = {
    legth: newPassword.length >= 6,
    hasNumber: /\d/.test(newPassword),
    hasLowercase: /[a-z]/.test(newPassword),
    hasUppercase: /[A-Z]/.test(newPassword),
    hasSpecial: /[!$@%]/.test(newPassword),
  };

  const onSubmit = (data) => {
    const response = changePassword(data.currentPassword, data.newPassword);
  };

  const handleSuccess = () => {
    logout();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Field className="max-w-sm">
        <FieldDescription>
          La contraseña debe tener al menos 6 caracteres e incluir una
          combinación de números, letras y caracteres especiales (!$@%).
        </FieldDescription>
        <FieldLabel htmlFor="current-password">
          Contraseña actual <span className="text-destructive">*</span>
        </FieldLabel>
        <InputGroup>
          <InputGroupInput
            id="current-password"
            type={showCurrentPassword ? "text" : "password"}
            {...register("currentPassword")}
          />
          <InputGroupAddon align="inline-end">
            <button
              type="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="focus:outline-none mr-2"
            >
              {showCurrentPassword ? (
                <EyeIcon size={17} />
              ) : (
                <EyeOffIcon size={17} />
              )}
            </button>
          </InputGroupAddon>
        </InputGroup>
        <FieldLabel htmlFor="new-password">
          Nueva contraseña <span className="text-destructive">*</span>
        </FieldLabel>
        <InputGroup>
          <InputGroupInput
            id="new-password"
            type={showNewPassword ? "text" : "password"}
            {...register("newPassword")}
          />
          <InputGroupAddon align="inline-end">
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="focus:outline-none mr-2"
            >
              {showNewPassword ? (
                <EyeIcon size={17} />
              ) : (
                <EyeOffIcon size={17} />
              )}
            </button>
          </InputGroupAddon>
        </InputGroup>
        <FieldGroup className="gap-1">
          <Field orientation="horizontal">
            <div className="pointer-events-none flex gap-3">
              <Checkbox
                id="password-lenght"
                name="password-lenght"
                checked={newPasswordValidation.legth}
              />
              <FieldLabel htmlFor="password-lenght" className="font-light">
                Al menos 6 caracteres
              </FieldLabel>
            </div>
          </Field>
          <Field orientation="horizontal">
            <div className="pointer-events-none flex gap-3">
              <Checkbox
                id="password-number"
                name="password-number"
                checked={newPasswordValidation.hasNumber}
              />
              <FieldLabel htmlFor="password-number" className="font-light">
                Contiene al menos un número (0-9)
              </FieldLabel>
            </div>
          </Field>
          <Field orientation="horizontal">
            <div className="pointer-events-none flex gap-3">
              <Checkbox
                id="password-lowercase-char"
                name="password-lowercase-char"
                checked={newPasswordValidation.hasLowercase}
              />
              <FieldLabel
                htmlFor="password-lowercase-char"
                className="font-light"
              >
                Contiene al menos una letra minúscula (a-z)
              </FieldLabel>
            </div>
          </Field>
          <Field orientation="horizontal">
            <div className="pointer-events-none flex gap-3">
              <Checkbox
                id="password-uppercase-char"
                name="password-uppercase-char"
                checked={newPasswordValidation.hasUppercase}
              />
              <FieldLabel
                htmlFor="password-uppercase-char"
                className="font-light"
              >
                Contiene al menos una letra mayúscula (A-Z)
              </FieldLabel>
            </div>
          </Field>
          <Field orientation="horizontal">
            <div className="pointer-events-none flex gap-3">
              <Checkbox
                id="password-special-char"
                name="password-special-char"
                checked={newPasswordValidation.hasSpecial}
              />
              <FieldLabel
                htmlFor="password-special-char"
                className="font-light"
              >
                Incluye al menos un carácter especial (!$@%)
              </FieldLabel>
            </div>
          </Field>
        </FieldGroup>
        <FieldLabel htmlFor="repeat-new-password">
          Repetir contraseña <span className="text-destructive">*</span>
        </FieldLabel>
        <InputGroup>
          <InputGroupInput
            id="repeat-new-password"
            type={showConfirmPassword ? "text" : "password"}
            {...register("confirmPassword")}
            aria-invalid={errors.confirmPassword ? true : false}
          />
          <InputGroupAddon align="inline-end">
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="focus:outline-none mr-2"
            >
              {showConfirmPassword ? (
                <EyeIcon size={17} />
              ) : (
                <EyeOffIcon size={17} />
              )}
            </button>
          </InputGroupAddon>
        </InputGroup>
        <FieldDescription className="text-red-600">
          {errors.confirmPassword && errors.confirmPassword.message}
        </FieldDescription>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              type="submit"
              className="cursor-pointer"
              variant={loading ? "outline" : ""}
              disabled={loading || !isValid}
            >
              {loading && <Spinner />}
              Continuar
            </Button>
          </AlertDialogTrigger>
          {error && (
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="text-base">
                  No se pudo completar la acción
                </AlertDialogTitle>
                <AlertDialogDescription>{error}</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogAction className="cursor-pointer">
                  Cerrar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          )}
          {success && (
            <AlertDialogContent>
              <AlertDialogHeader className="flex flex-col content-center">
                <AlertDialogMedia className="sm bg-emerald-100 text-emerald-700 self-center">
                  <Check />
                </AlertDialogMedia>
                <AlertDialogTitle className="text-base text-center">
                  Contraseña actualizada correctamente
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Tu sesión se cerrará automáticamente por seguridad. Para
                  continuar, deberás iniciar sesión nuevamente con tu nueva
                  contraseña.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogAction
                  onClick={handleSuccess}
                  className="cursor-pointer"
                >
                  Aceptar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          )}
        </AlertDialog>
      </Field>
    </form>
  );
}
