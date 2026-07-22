import { z } from "zod"

export const SUPPLY_CATEGORIES = [
  "Malta",
  "Lúpulos",
  "Levadura",
  "Agua",
  "Adjunto",
  "Clarificante",
  "Gas",
  "Limpieza",
  "Otro",
]

export const PACKAGING_TYPES = [
  "Botella",
  "Lata",
  "Caja",
  "Barril",
  "Etiqueta",
  "Tapa",
  "Pack",
  "Film",
  "Bolsa",
  "Otro",
]

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

    supply_category: z.enum(SUPPLY_CATEGORIES, {
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

export const createPackagingSupplySchema = (existingSupplies = [], excludeId = null) =>
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

    base_uom_id: z
      .number({ invalid_type_error: "Seleccione una unidad de medida" })
      .int()
      .positive("Seleccione una unidad de medida"),

    min_stock_level: z
      .number({ invalid_type_error: "Debe ser un número" })
      .gt(0, "El stock mínimo debe ser mayor a cero"),

    packaging_type: z.enum(PACKAGING_TYPES, {
      errorMap: () => ({ message: "Seleccione un tipo de envase" }),
    }),

    material: z
      .string()
      .trim()
      .min(1, "El material es obligatorio"),

    capacity_ml: z
      .number({ invalid_type_error: "Debe ser un número" })
      .min(0, "La capacidad no puede ser negativa")
      .optional(),
  })
