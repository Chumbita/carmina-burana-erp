import { z } from "zod";

export const createBeerSchema = () =>
  z.object({
    name: z.string().min(1, "El nombre es obligatorio"),
    style: z.string().min(1, "El estilo es obligatorio"),
    abv: z
      .number({ invalid_type_error: "El ABV es obligatorio" })
      .min(0, "El ABV no puede ser negativo")
      .max(100, "El ABV debe estar entre 0 y 100"),
    ibu: z
      .number({ invalid_type_error: "El IBU es obligatorio" })
      .min(0, "El IBU no puede ser negativo"),
    fermentation_days: z
      .number({ invalid_type_error: "Debe ser mayor a 0" })
      .positive("Debe ser mayor a 0"),
    conditioning_days: z
      .number({ invalid_type_error: "Debe ser mayor a 0" })
      .positive("Debe ser mayor a 0"),
    min_stock_level: z
      .number({ invalid_type_error: "Debe ser un número" })
      .nonnegative("No puede ser negativo")
      .optional(),
  });
