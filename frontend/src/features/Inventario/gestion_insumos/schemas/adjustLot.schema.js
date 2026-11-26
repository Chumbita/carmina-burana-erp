import { z } from "zod"

export function createAdjustLotSchema(currentQuantity, reservedQuantity) {
  return z.object({
    new_quantity: z
      .coerce.number({ invalid_type_error: "La cantidad es requerida" })
      .min(0, "La cantidad no puede ser negativa")
      .refine((val) => val !== Number(currentQuantity), {
        message: "La nueva cantidad debe ser distinta a la actual",
      })
      .refine((val) => val >= Number(reservedQuantity), {
        message: `No puede ser menor a lo reservado (${reservedQuantity})`,
      }),
    reason: z
      .string()
      .trim()
      .min(3, "El motivo debe tener al menos 3 caracteres")
      .max(500, "Máximo 500 caracteres"),
  })
}
