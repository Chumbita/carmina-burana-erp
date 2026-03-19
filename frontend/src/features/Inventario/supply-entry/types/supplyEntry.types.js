// Type definitions for Supply Entry

/**
 * @typedef {Object} SupplyItem
 * @property {string} inputId - ID del insumo
 * @property {number} quantity - Cantidad
 * @property {number} unitCost - Costo unitario
 * @property {string} [expirationDate] - Fecha de vencimiento
 * @property {string} [batchNumber] - Número de lote
 * @property {string} [comment] - Comentario
 */

/**
 * @typedef {Object} SupplyEntry
 * @property {string} id - ID del registro
 * @property {string} receptionId - ID único de recepción
 * @property {string} date - Fecha del registro
 * @property {string} supplier - Proveedor
 * @property {string} [invoiceNumber] - Número de factura
 * @property {string} [description] - Descripción
 * @property {number} totalCost - Costo total
 * @property {'active'|'annulled'} status - Estado
 * @property {number} totalQuantity - Cantidad total de artículos
 * @property {number} itemCount - Número de artículos
 * @property {SupplyItem[]} items - Lista de artículos
 * @property {string} [annulledAt] - Fecha de anulación
 * @property {string} [annulmentReason] - Motivo de anulación
 */

/**
 * @typedef {Object} AvailableInput
 * @property {string} id - ID del insumo
 * @property {string} name - Nombre del insumo
 * @property {string} unit - Unidad de medida
 */

/**
 * @typedef {Object} SupplyEntryFilters
 * @property {string} dateFrom - Fecha desde
 * @property {string} dateTo - Fecha hasta
 * @property {string} selectedSupplier - Proveedor seleccionado
 * @property {string} searchTerm - Término de búsqueda
 */

/**
 * @typedef {Object} SupplyEntryFormData
 * @property {string} supplier - Proveedor
 * @property {string} entryDate - Fecha de ingreso
 * @property {string} [invoiceNumber] - Número de factura
 * @property {string} [description] - Descripción
 * @property {SupplyItem[]} items - Artículos
 */
