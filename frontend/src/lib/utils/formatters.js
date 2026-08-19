export function formatDate(dateStr) {
  if (!dateStr) return "—"
  return new Date(dateStr).toLocaleDateString("es-AR")
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
