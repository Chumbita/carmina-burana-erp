import { z } from "zod"

const textRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ0-9\s]+$/

// Función de validación personalizada para nombre único
const validateUniqueName = (name, excludeId = null) => {
  // Esta función se actualizará dinámicamente con los datos reales
  return true // Por defecto, se actualizará en el componente
}

export const createInsumoSchema = (existingInputs = [], excludeId = null) => z.object({
  name: z
    .string()
    .trim()
    .min(1, "El nombre es obligatorio")
    .regex(textRegex, "No se permiten caracteres especiales")
    .refine((name) => {
      const normalizedName = name.trim().toLowerCase()
      const existingInput = existingInputs.find(input => {
        if (excludeId && input.id === excludeId) return false
        return input.name.toLowerCase() === normalizedName
      })
      return !existingInput
    }, "Ya existe un insumo con este nombre"),

  brand: z
    .string()
    .trim()
    .optional()
    .refine((val) => {
      if (!val) return true // Permitir undefined/vacío
      return textRegex.test(val) || "No se permiten caracteres especiales"
    }),

  category: z
    .string()
    .trim()
    .optional()
    .refine((val) => {
      if (!val) return true // Permitir undefined/vacío
      return textRegex.test(val) || "No se permiten caracteres especiales"
    }),

  unit: z
    .string()
    .min(1, "La unidad de medida es obligatoria"),

  minimum_stock: z
    .number("El stock mínimo debe ser un número")
    .min(0, "El stock mínimo no puede ser negativo")
    .optional()
    .default(0),

  image: z.any().optional(),
})

// Schema por defecto para compatibilidad
export const insumoSchema = createInsumoSchema()
