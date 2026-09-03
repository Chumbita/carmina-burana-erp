import { z } from "zod"

const bomLineSchema = z.object({
  component_item_id: z.number().min(1, "Seleccione un componente"),
  quantity: z.number().gt(0, "La cantidad debe ser mayor a 0"),
  uom: z.number().optional().nullable(),
})

export const createBomSchema = z.object({
  parent_item_id: z.number().min(1, "Seleccione un producto padre"),
  quantity: z.number().gt(0, "La cantidad debe ser mayor a 0"),
  uom_id: z.number().min(1, "Seleccione una unidad de medida"),
  valid_from: z.string().optional(),
  lines: z.array(bomLineSchema).min(1, "Agregue al menos un componente"),
})
