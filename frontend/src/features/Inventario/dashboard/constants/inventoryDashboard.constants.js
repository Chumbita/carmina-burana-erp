export const STATUS_COLORS = {
  "Sin stock": "#DC2626",
  "Crítico": "#F97316",
  "Bajo": "#EAB308",
  "Óptimo": "#16A34A",
}

export const STATUS_ORDER = ["Óptimo", "Bajo", "Crítico", "Sin stock"]

export const CATEGORY_COLORS = {
  maltas: "#2563EB",
  lupulos: "#059669",
  levaduras: "#7C3AED",
  envases: "#EA580C",
  otros: "#64748B",
}

export const CATEGORY_ORDER = ["maltas", "lupulos", "levaduras", "envases", "otros"]

export const CHART_CONFIG = {
  count: { label: "Items" },
}

export const EMPTY_INVENTORY_DASHBOARD = {
  summary: {
    active: 0,
    out_of_stock: 0,
    critical: 0,
    low: 0,
    optimal: 0,
    packaging: 0,
    production: 0,
  },
  stock_by_status: [],
  stock_by_category: [],
  top_low_stock: [],
  expiring_lots: [],
  recent_entries: [],
}
