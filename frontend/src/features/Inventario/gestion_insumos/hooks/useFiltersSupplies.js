
import { useState } from "react"
import { SUPPLY_CATEGORIES } from "../schemas/supply.schema"

export function useSupplyFilters() {
  const categories = [
    { value: "all", label: "Categorías..." },
    ...SUPPLY_CATEGORIES.map(cat => ({ value: cat, label: cat }))
  ]

  const stockStatuses = [
    { value: "all", label: "Estado de stock..." },
    { value: "critico", label: "Crítico" },
    { value: "bajo", label: "Bajo" },
    { value: "optimo", label: "Normal" },
  ]

  const [categoryFilter, setCategoryFilter] = useState("all")
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

  const filteredSupplies = (supplies) => {
    let filtered = supplies.filter(supply => {
      const searchLower = search.trim().toLowerCase()

      // Filtro de búsqueda (nombre o marca)
      const matchesSearch =
        supply.name?.toLowerCase().includes(searchLower) ||
        supply.brand_name?.toLowerCase().includes(searchLower)

      // Filtro de categoría
      const matchesCategory =
        categoryFilter === "all" ||
        normalize(supply?.supply_category) === normalize(categoryFilter)

      // Filtro de estado de stock
      const matchesStockStatus =
        stockFilter === "all" ||
        supply.estado_stock === stockFilter

      return matchesSearch && matchesCategory && matchesStockStatus
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
    stockStatuses,
    search,
    categoryFilter,
    stockFilter,
    sortBy,
    sortOrder,
    currentPage,
    itemsPerPage,
    setSearch: handleSetSearch,
    setCategoryFilter: handleSetCategoryFilter,
    setStockFilter: handleSetStockFilter,
    setSortBy: handleSetSortBy,
    setSortOrder: handleSetSortOrder,
    setCurrentPage,
    filteredSupplies,
  }
}
