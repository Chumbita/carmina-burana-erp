import { z } from "zod"

const textRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ0-9\s]+$/

export const insumoSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(1, "El nombre es obligatorio")
    .regex(textRegex, "No se permiten caracteres especiales"),

  marca: z
    .string()
    .trim()
    .min(1, "La marca es obligatoria")
    .regex(textRegex, "No se permiten caracteres especiales"),

  categoria: z
    .string()
    .trim()
    .min(1, "La categoría es obligatoria")
    .regex(textRegex, "No se permiten caracteres especiales"),

  unidadMedida: z
    .string()
    .min(1, "*"),

  stockMinimo: z
    .number()
    .min(0, "El stock mínimo no puede ser negativo"),

  imagen: z.any().optional(),
})
