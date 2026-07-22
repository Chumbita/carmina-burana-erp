export function formatDate(dateStr) {
  if (!dateStr) return "—"
  return new Date(dateStr).toLocaleDateString("es-AR")
}

export function formatCurrency(value) {
  return Number(value).toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
  })
}
