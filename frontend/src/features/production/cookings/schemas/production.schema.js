import { z } from "zod"

export const createProductionSchema = () =>
  z.object({
    item_id: z.number({ invalid_type_error: "El item es obligatorio" }).int().positive("El item es obligatorio"),
    bom_id: z.number({ invalid_type_error: "El BOM es obligatorio" }).int().positive("El BOM es obligatorio"),
    planned_quantity: z.number({ invalid_type_error: "La cantidad planeada es obligatoria" }).positive("La cantidad debe ser mayor a 0"),
    schedule_date: z
      .string()
      .min(1, "La fecha programada es requerida")
      .refine((val) => !isNaN(Date.parse(val)), {
        message: "Debe ser una fecha válida",
      }),
    description: z.string().optional(),
  })

export const productionSchema = createProductionSchema()
