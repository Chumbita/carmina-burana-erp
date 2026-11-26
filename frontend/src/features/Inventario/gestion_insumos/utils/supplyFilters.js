import { SUPPLY_CATEGORIES, PACKAGING_TYPES } from '../schemas/supply.schema'

export const ALL_FILTER_VALUE = 'all'

export const SUPPLY_ITEM_TYPE_OPTIONS = [
  { value: ALL_FILTER_VALUE, label: 'Tipo...' },
  { value: 'SUPPLY', label: 'Producción' },
  { value: 'PACKAGING_SUPPLY', label: 'Envase' },
]

export const SUPPLY_STOCK_STATUS_OPTIONS = [
  { value: ALL_FILTER_VALUE, label: 'Estado de stock...' },
  { value: 'critico', label: 'Crítico' },
  { value: 'bajo', label: 'Bajo' },
  { value: 'optimo', label: 'Normal' },
]

export const SUPPLY_SORT_FIELDS = [
  { key: 'name', label: 'Nombre' },
  { key: 'stock', label: 'Stock' },
]

export function buildCategoryOptions() {
  return [
    { value: ALL_FILTER_VALUE, label: 'Categorías...' },
    ...[...SUPPLY_CATEGORIES, ...PACKAGING_TYPES].map((category) => ({
      value: category,
      label: category,
    })),
  ]
}
