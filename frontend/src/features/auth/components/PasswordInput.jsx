import { EyeIcon, EyeOffIcon } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/InputGroup";

/**
 * PasswordInput - Campo de contraseña con toggle de visibilidad.
 *
 * Presentación pura: no conoce el formulario, la validación ni el submit.
 * Reenvía cualquier prop (incluido el `ref` que entrega React Hook Form)
 * al input subyacente.
 */
export function PasswordInput({
  id,
  invalid = false,
  visible = false,
  onToggleVisibility,
  ...inputProps
}) {
  return (
    <InputGroup>
      <InputGroupInput
        id={id}
        type={visible ? "text" : "password"}
        aria-invalid={invalid || undefined}
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
  );
}
