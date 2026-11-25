import { EyeIcon, EyeOffIcon } from "lucide-react";

import {
  Field,
  FieldDescription,
  FieldLabel,
} from "@/components/ui/Field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/InputGroup";

/**
 * PasswordField - Campo de contraseña con botón de visibilidad.
 * Componente de presentación: recibe el estado y los handlers del formulario.
 */
export function PasswordField({
  id,
  label,
  invalid = false,
  visible = false,
  onToggleVisibility,
  errorMessage,
  ...inputProps
}) {
  return (
    <Field data-invalid={invalid}>
      <FieldLabel htmlFor={id}>
        {label} <span className="text-destructive">*</span>
      </FieldLabel>
      <InputGroup>
        <InputGroupInput
          id={id}
          type={visible ? "text" : "password"}
          aria-invalid={invalid}
          {...inputProps}
        />
        <InputGroupAddon align="inline-end">
          <button
            type="button"
            onClick={onToggleVisibility}
            aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
            className="focus:outline-none mr-2 cursor-pointer"
          >
            {visible ? <EyeIcon size={17} /> : <EyeOffIcon size={17} />}
          </button>
        </InputGroupAddon>
      </InputGroup>
      {errorMessage && (
        <FieldDescription className="text-red-600">{errorMessage}</FieldDescription>
      )}
    </Field>
  );
}
