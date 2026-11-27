import { z } from 'zod'

export const supplyItemSchema = z.object({
  supplyId: z.number().min(1, 'Seleccione un insumo'),
  quantity: z.number().min(0.01, 'La cantidad debe ser mayor a 0'),
  unitCost: z.number().min(0.01, 'El costo unitario debe ser mayor a 0'),
  expirationDate: z.string().min(1, 'La fecha de vencimiento es requerida'),
  batchNumber: z.string().optional(),
  comment: z.string().optional(),
})

export const supplyEntrySchema = z.object({
  supplierId: z.number().min(1, 'Seleccione un proveedor'),
  entryDate: z.string().min(1, 'La fecha de ingreso es requerida'),
  invoiceNumber: z.string().optional(),
  description: z.string().optional(),
  items: z.array(supplyItemSchema).min(1, 'Debe agregar al menos un artículo'),
})

export const annulmentSchema = z.object({
  reason: z.string().min(1, 'Debe especificar un motivo para anular'),
})
