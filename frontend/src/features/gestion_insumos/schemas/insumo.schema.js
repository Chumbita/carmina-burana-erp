import { z } from "zod"

const textRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ0-9\s]+$/

export const insumoSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "El nombre es obligatorio")
    .regex(textRegex, "No se permiten caracteres especiales"),

  brand: z
    .string()
    .trim()
    .min(1, "La marca es obligatoria")
    .regex(textRegex, "No se permiten caracteres especiales"),

  category: z
    .string()
    .trim()
    .min(1, "La categoría es obligatoria")
    .regex(textRegex, "No se permiten caracteres especiales"),

  unit: z
    .string()
    .min(1, ""),

  minimum_stock: z
    .number("El stock mínimo debe ser un número")
    .min(0, "El stock mínimo no puede ser negativo"),

  image: z.any().optional(),
})
