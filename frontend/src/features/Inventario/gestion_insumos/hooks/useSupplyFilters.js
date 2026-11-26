import { useCallback, useEffect, useMemo, useState } from "react"
import {
  ALL_FILTER_VALUE,
  buildCategoryOptions,
  SUPPLY_ITEM_TYPE_OPTIONS,
  SUPPLY_SORT_FIELDS,
  SUPPLY_STOCK_STATUS_OPTIONS,
} from "../utils/supplyFilters"

const SEARCH_DEBOUNCE_MS = 350

const INITIAL_FILTERS = {
  search: "",
  category: ALL_FILTER_VALUE,
  itemType: ALL_FILTER_VALUE,
  stock: ALL_FILTER_VALUE,
  sortBy: "name",
  sortOrder: "asc",
}

/**
 * Estado de filtros/orden/búsqueda de la grilla de insumos.
 * Devuelve los parámetros ya normalizados para el endpoint de listado.
 */
export function useSupplyFilters() {
  const [search, setSearch] = useState(INITIAL_FILTERS.search)
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [category, setCategory] = useState(INITIAL_FILTERS.category)
  const [itemType, setItemType] = useState(INITIAL_FILTERS.itemType)
  const [stock, setStock] = useState(INITIAL_FILTERS.stock)
  const [sortBy, setSortBy] = useState(INITIAL_FILTERS.sortBy)
  const [sortOrder, setSortOrder] = useState(INITIAL_FILTERS.sortOrder)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), SEARCH_DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [search])

  const categoryOptions = useMemo(() => buildCategoryOptions(), [])

  const query = useMemo(
    () => ({
      q: debouncedSearch || undefined,
      category: category !== ALL_FILTER_VALUE ? category : undefined,
      itemType: itemType !== ALL_FILTER_VALUE ? itemType : undefined,
      stockStatus: stock !== ALL_FILTER_VALUE ? stock : undefined,
      sortBy,
      sortOrder,
    }),
    [debouncedSearch, category, itemType, stock, sortBy, sortOrder]
  )

  const hasActiveFilters =
    Boolean(search) ||
    category !== ALL_FILTER_VALUE ||
    itemType !== ALL_FILTER_VALUE ||
    stock !== ALL_FILTER_VALUE

  const resetFilters = useCallback(() => {
    setSearch(INITIAL_FILTERS.search)
    setCategory(INITIAL_FILTERS.category)
    setItemType(INITIAL_FILTERS.itemType)
    setStock(INITIAL_FILTERS.stock)
  }, [])

  return {
    search,
    category,
    itemType,
    stock,
    sortBy,
    sortOrder,
    query,
    hasActiveFilters,
    categoryOptions,
    itemTypeOptions: SUPPLY_ITEM_TYPE_OPTIONS,
    stockOptions: SUPPLY_STOCK_STATUS_OPTIONS,
    sortFields: SUPPLY_SORT_FIELDS,
    setSearch,
    setCategory,
    setItemType,
    setStock,
    setSortBy,
    setSortOrder,
    resetFilters,
  }
}
