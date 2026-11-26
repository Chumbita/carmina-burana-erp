const REFERENCE_LABELS = {
  supply_entry: 'Entrada',
  inventory_adjustment: 'Ajuste de inventario',
  production_order: 'Orden de producción',
}

const REFERENCE_ROUTES = {
  supply_entry: (id) => `/inventario/ingreso-insumos/${id}`,
}

/**
 * Resuelve la etiqueta, el texto visible y la ruta (si existe) de la
 * referencia de una transacción de stock.
 */
export function resolveTransactionReference(referenceType, referenceId) {
  const label = REFERENCE_LABELS[referenceType] ?? referenceType
  const buildRoute = REFERENCE_ROUTES[referenceType]

  return {
    label,
    text: `${label} #${referenceId}`,
    to: buildRoute ? buildRoute(referenceId) : null,
  }
}
