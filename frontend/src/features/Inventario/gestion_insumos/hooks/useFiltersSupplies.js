
// /hooks/useFilter.js
import { useMemo, useState } from "react"
import { SUPPLY_CATEGORIES } from "../schemas/supply.schema"

function getCategory(input) {
  return input?.category ?? input?.supply_category ?? input?.packaging_type ?? ""
}

export function useInputFilters(inputs = []) {
  const categories = useMemo(() => {
    const categoryValues = new Set(SUPPLY_CATEGORIES)

    inputs.forEach((input) => {
      const category = getCategory(input)
      if (category) categoryValues.add(category)
    })

    return [
      { value: "all", label: "Categorías..." },
      ...Array.from(categoryValues).map(cat => ({ value: cat, label: cat }))
    ]
  }, [inputs])

  const stockStatuses = [
    { value: "all", label: "Estado de stock..." },
    { value: "critico", label: "Crítico" },
    { value: "bajo", label: "Bajo" },
    { value: "optimo", label: "Normal" },
  ]

  const itemTypes = [
    { value: "all", label: "Tipo..." },
    { value: "SUPPLY", label: "Insumo" },
    { value: "PACKAGING_SUPPLY", label: "Packaging" },
  ]

  const [categoryFilter, setCategoryFilter] = useState("all")
  const [itemTypeFilter, setItemTypeFilter] = useState("all")
  const [stockFilter, setStockFilter] = useState("all")
  const [search, setSearch] = useState("")
  const [sortBy, setSortBy] = useState("id") // "id", "name" o "stock"
  const [sortOrder, setSortOrder] = useState("asc") // "asc" o "desc"
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20

  // Resetear página cuando cambian los filtros
  const resetPage = () => setCurrentPage(1)

  const handleSetSearch = (value) => {
    setSearch(value)
    resetPage()
  }

  const handleSetCategoryFilter = (value) => {
    setCategoryFilter(value)
    resetPage()
  }

  const handleSetItemTypeFilter = (value) => {
    setItemTypeFilter(value)
    resetPage()
  }

  const handleSetStockFilter = (value) => {
    setStockFilter(value)
    resetPage()
  }

  const handleSetSortBy = (value) => {
    setSortBy(value)
    resetPage()
  }

  const handleSetSortOrder = (value) => {
    setSortOrder(value)
    resetPage()
  }

  const normalize = (str) => str?.trim().toLowerCase()

  const filteredInputs = (inputs) => {
    let filtered = inputs.filter(input => {
      const searchLower = search.trim().toLowerCase()

      // Filtro de búsqueda (nombre o marca)
      const matchesSearch =
        input.name?.toLowerCase().includes(searchLower) ||
        input.brand_name?.toLowerCase().includes(searchLower)

      // Filtro de categoría
      const matchesCategory =
        categoryFilter === "all" ||
        normalize(getCategory(input)) === normalize(categoryFilter)

      const matchesItemType =
        itemTypeFilter === "all" ||
        normalize(input.item_type) === normalize(itemTypeFilter)

      // Filtro de estado de stock
      const matchesStockStatus =
        stockFilter === "all" ||
        input.estado_stock === stockFilter

      return matchesSearch && matchesCategory && matchesItemType && matchesStockStatus
    })

    // Aplicar ordenamiento
    filtered.sort((a, b) => {
      let aValue, bValue

      if (sortBy === "id") {
        aValue = a.id || 0
        bValue = b.id || 0
      } else if (sortBy === "name") {
        aValue = a.name?.toLowerCase() || ""
        bValue = b.name?.toLowerCase() || ""
      } else if (sortBy === "stock") {
        aValue = a.stock_total || 0
        bValue = b.stock_total || 0
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0
      }
    })

    // Aplicar paginación
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const paginatedResults = filtered.slice(startIndex, endIndex)

    return {
      items: paginatedResults,
      totalCount: filtered.length,
      totalPages: Math.ceil(filtered.length / itemsPerPage),
      currentPage,
    }
  }

  return {
    categories,
    itemTypes,
    stockStatuses,
    search,
    categoryFilter,
    itemTypeFilter,
    stockFilter,
    sortBy,
    sortOrder,
    currentPage,
    itemsPerPage,
    setSearch: handleSetSearch,
    setCategoryFilter: handleSetCategoryFilter,
    setItemTypeFilter: handleSetItemTypeFilter,
    setStockFilter: handleSetStockFilter,
    setSortBy: handleSetSortBy,
    setSortOrder: handleSetSortOrder,
    setCurrentPage,
    filteredInputs,
  }
}
