/**
 * Reglas de complejidad de contraseña mostradas al usuario.
 * Deben mantenerse alineadas con `schemas/changePasswordForm.schema.js`.
 */
export function getPasswordRequirements(password = "") {
  return [
    {
      id: "length",
      label: "Al menos 6 caracteres",
      met: password.length >= 6,
    },
    {
      id: "number",
      label: "Contiene al menos un número (0-9)",
      met: /\d/.test(password),
    },
    {
      id: "lowercase",
      label: "Contiene al menos una letra minúscula (a-z)",
      met: /[a-z]/.test(password),
    },
    {
      id: "uppercase",
      label: "Contiene al menos una letra mayúscula (A-Z)",
      met: /[A-Z]/.test(password),
    },
    {
      id: "special",
      label: "Incluye al menos un carácter especial (!$@%)",
      met: /[!$@%]/.test(password),
    },
  ];
}
