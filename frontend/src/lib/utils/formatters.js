export function formatDate(dateStr) {
  if (!dateStr) return "—"
  const [datePart] = String(dateStr).split("T")
  // Fechas sin hora (YYYY-MM-DD): formatear por partes para evitar
  // el desfase de un día por zona horaria (new Date la interpreta en UTC)
  if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
    const [y, m, d] = datePart.split("-")
    return `${d}/${m}/${y}`
  }
  return new Date(dateStr).toLocaleDateString("es-AR")
}

export function formatDateTime(value) {
  if (!value) return "Sin fecha"
  return new Date(value).toLocaleString("es-AR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  })
}

export function formatDecimal(value, maxFractionDigits = 2) {
  if (value === null || value === undefined || value === "") return "0"
  const num = Number(value)
  if (!Number.isFinite(num)) return "0"
  return num.toLocaleString("es-AR", {
    maximumFractionDigits: maxFractionDigits,
  })
}

export function formatCurrency(value) {
  return Number(value).toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
  })
}
