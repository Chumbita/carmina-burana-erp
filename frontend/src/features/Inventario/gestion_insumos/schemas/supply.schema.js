import { z } from "zod"

export const SUPPLY_CATEGORIES = [
  { value: "MALT",      label: "Malta" },
  { value: "HOPS",      label: "Lúpulos" },
  { value: "YEAST",     label: "Levadura" },
  { value: "WATER",     label: "Agua" },
  { value: "ADJUNCT",   label: "Adjunto" },
  { value: "CLARIFIER", label: "Clarificante" },
  { value: "GAS",       label: "Gas" },
  { value: "CLEANING",  label: "Limpieza" },
  { value: "OTHER",     label: "Otro" },
]

const SUPPLY_CATEGORY_VALUES = SUPPLY_CATEGORIES.map((c) => c.value)

export const createSupplySchema = (existingSupplies = [], excludeId = null) =>
  z.object({
    name: z
      .string()
      .trim()
      .min(1, "El nombre es obligatorio")
      .refine((name) => {
        const normalized = name.trim().toLowerCase()
        const exists = existingSupplies.find((supply) => {
          if (excludeId && supply.id === excludeId) return false
          return supply.name.toLowerCase() === normalized
        })
        return !exists
      }, "Ya existe un insumo con este nombre"),

    brand_id: z
      .number({ invalid_type_error: "Seleccione una marca" })
      .int()
      .positive("Seleccione una marca"),

    supply_category: z.enum(SUPPLY_CATEGORY_VALUES, {
      errorMap: () => ({ message: "Seleccione una categoría" }),
    }),

    base_uom_id: z
      .number({ invalid_type_error: "Seleccione una unidad de medida" })
      .int()
      .positive("Seleccione una unidad de medida"),

    min_stock_level: z
      .number({ invalid_type_error: "Debe ser un número" })
      .min(0, "El stock mínimo no puede ser negativo")
      .default(0),
  })

// Schema por defecto para compatibilidad
export const supplySchema = createSupplySchema()
