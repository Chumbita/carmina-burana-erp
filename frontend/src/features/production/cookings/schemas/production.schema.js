import { z } from "zod";

export const createProductionSchema = () =>
  z.object({
    item_id: z
      .number({ invalid_type_error: "El item es obligatorio" })
      .int()
      .positive("El item es obligatorio"),
    bom_id: z
      .number({ invalid_type_error: "El BOM es obligatorio" })
      .int()
      .positive("El BOM es obligatorio"),
    planned_quantity: z
      .number({ invalid_type_error: "La cantidad planeada es obligatoria" })
      .positive("La cantidad debe ser mayor a 0"),
    schedule_date: z
      .string()
      .min(1, "La fecha programada es requerida")
      .refine((val) => !isNaN(Date.parse(val)), {
        message: "Debe ser una fecha válida",
      }),
    description: z.string().optional(),
  });

export const productionSchema = createProductionSchema();

export const completeProductionSchema = () => {
  return z
    .object({
      produced_quantity: z.coerce
        .number({ required_error: "La cantidad es requerida" })
        .positive("La cantidad debe ser mayor a 0"),
      lot_code: z
        .string({ required_error: "El código de lote es requerido" })
        .min(1, "El código de lote no puede estar vacío"),
      production_date: z
        .string({ required_error: "La fecha de producción es requerida" })
        .min(1, "Fecha inválida"),
      expiration_date: z
        .string({ required_error: "La fecha de vencimiento es requerida" })
        .min(1, "Fecha inválida"),
      unit_cost: z.coerce
        .number({ required_error: "El costo unitario es requerido" })
        .nonnegative("El costo no puede ser negativo"),
    })
    .refine(
      (data) => {
        // Validación cruzada: Vencimiento debe ser posterior o igual a producción
        const prod = new Date(data.production_date);
        const exp = new Date(data.expiration_date);
        return exp >= prod;
      },
      {
        message:
          "La fecha de vencimiento no puede ser anterior a la de producción",
        path: ["expiration_date"],
      },
    );
};
