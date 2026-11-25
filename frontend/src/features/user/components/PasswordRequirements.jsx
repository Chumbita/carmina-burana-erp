import { Field, FieldGroup, FieldLabel } from "@/components/ui/Field";
import { Checkbox } from "@/components/ui/Checkbox";

/**
 * PasswordRequirements - Checklist de requisitos de contraseña en vivo.
 * Componente de presentación puro.
 */
export function PasswordRequirements({ requirements }) {
  return (
    <FieldGroup className="gap-1">
      {requirements.map(({ id, label, met }) => (
        <Field key={id} orientation="horizontal">
          <div className="pointer-events-none flex gap-3">
            <Checkbox id={`password-${id}`} name={`password-${id}`} checked={met} />
            <FieldLabel htmlFor={`password-${id}`} className="font-light">
              {label}
            </FieldLabel>
          </div>
        </Field>
      ))}
    </FieldGroup>
  );
}
