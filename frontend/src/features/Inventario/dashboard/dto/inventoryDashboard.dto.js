import { CATEGORY_COLORS, CATEGORY_ORDER, STATUS_ORDER } from '../constants/inventoryDashboard.constants'

/**
 * Transformaciones del payload analítico de inventario al shape que
 * consumen las gráficas y tablas del dashboard.
 */

export function normalizeCategory(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
}

export function buildStatusData(stockByStatus = []) {
  return stockByStatus.filter((item) => item.count > 0)
}

export function buildStatusLegend(stockByStatus = []) {
  return STATUS_ORDER.map(
    (statusName) =>
      stockByStatus.find((item) => item.status === statusName) ?? { status: statusName, count: 0 },
  )
}

export function buildCategoryData(stockByCategory = []) {
  return stockByCategory
    .filter((item) => Number(item.stock_total) > 0)
    .map((item, index) => {
      const categoryKey = normalizeCategory(item.category)
      return {
        ...item,
        categoryKey,
        stockTotal: Number(item.stock_total),
        fill: CATEGORY_COLORS[categoryKey] ?? CATEGORY_COLORS.otros,
        fallbackOrder: index,
      }
    })
    .sort((a, b) => {
      const orderA = CATEGORY_ORDER.indexOf(a.categoryKey)
      const orderB = CATEGORY_ORDER.indexOf(b.categoryKey)
      return (orderA === -1 ? 99 + a.fallbackOrder : orderA) - (orderB === -1 ? 99 + b.fallbackOrder : orderB)
    })
}

export function getMaxCategoryStock(categoryData = []) {
  return Math.max(...categoryData.map((item) => item.stockTotal), 0)
}
