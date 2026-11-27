import { parseSupplyEntryDateTime } from '../constants/supplyEntry.constants'

const CANCELLED_STATUS = 'CANCELED'

/**
 * Transformaciones de datos del feature supply-entry.
 * Mantienen la API (snake_case) separada del shape que consumen los componentes.
 */

export function isCancelledStatus(status) {
  return status === CANCELLED_STATUS
}

/**
 * Normaliza la respuesta de /supply-entries/{id} al shape de la vista de detalle.
 */
export function normalizeEntry(entry) {
  if (!entry) return entry

  return {
    ...entry,
    status: isCancelledStatus(entry.status) ? 'cancelled' : 'active',
    reception_number: entry.document_number,
    supplier: entry.supplier?.name ?? 'Sin proveedor',
    invoiceNumber: entry.document_number,
    total_cost: Number(entry.total_cost ?? 0),
    annulledAt: entry.canceled_at,
    annulmentReason: entry.cancellation_reason,
    items: (entry.lines ?? []).map((line) => ({
      id: line.lot_id ?? line.item?.id,
      supply_id: line.item?.id,
      supply_name: line.item?.name,
      amount: Number(line.quantity ?? 0),
      unit_cost: Number(line.unit_cost ?? 0),
      expire_date: line.expiration_date?.split('T')[0],
      comment: line.comment,
      batch: {
        id: line.lot_id,
        initial_amount: Number(line.quantity ?? 0),
        current_amount: Number(line.quantity ?? 0),
      },
    })),
  }
}

/**
 * Convierte el form de react-hook-form al payload de POST /supply-entries.
 */
export function buildSupplyEntryPayload(formData) {
  return {
    supplier_id: formData.supplierId,
    document_number: formData.invoiceNumber || undefined,
    entry_date: parseSupplyEntryDateTime(formData.entryDate),
    description: formData.description || undefined,
    lines: (formData.items ?? []).map((item) => ({
      item_id: item.supplyId,
      quantity: item.quantity,
      unit_cost: item.unitCost,
      expiration_date: new Date(item.expirationDate).toISOString(),
      lot_code: item.batchNumber || undefined,
      comment: item.comment || undefined,
    })),
  }
}

/**
 * Agrega el número de fila correlativo que muestra la tabla de ingresos.
 */
export function mapSupplyEntryRows(entries = [], page = 1, pageSize = 20) {
  return entries.map((entry, index) => ({
    ...entry,
    row_number: (page - 1) * pageSize + index + 1,
  }))
}

export function sumEntryItemsAmount(entry) {
  return (entry?.items ?? []).reduce((total, item) => total + Number(item.amount || 0), 0)
}
