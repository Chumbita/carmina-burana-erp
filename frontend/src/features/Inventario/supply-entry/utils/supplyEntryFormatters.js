const STATUS_LABELS = {
  active: 'Activa',
  cancelled: 'Anulada',
}

export function getStatusLabel(status) {
  return STATUS_LABELS[status] || 'Desconocido'
}

export function getAnnulmentTooltip(canAnnul) {
  return canAnnul ? '' : 'No se puede anular: hay lotes consumidos'
}

export function formatEntryDateTime(value) {
  if (!value) return '—'

  return new Date(value).toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  })
}

export function formatEntryDate(value) {
  return value ? new Date(`${value}T00:00:00`).toLocaleDateString('es-AR') : '-'
}

export function formatEntryMoney(value) {
  return `$${Number(value || 0).toFixed(2)}`
}
