
// /hooks/useFilter.js
import { useState } from "react"

export function useInputFilters() {
  const categories = [
    { value: "all", label: "Categorías..." },
    { value: "Lúpulo", label: "Lúpulo" },
    { value: "Malta", label: "Malta" },
    { value: "Envases", label: "Envases" },
  ]

  const stockStatuses = [
    { value: "all", label: "Estado de stock..." },
    { value: "critico", label: "Crítico" },
    { value: "bajo", label: "Bajo" },
    { value: "optimo", label: "Normal" },
    { value: "sin stock", label: "Sin stock" },
  ]

  const [categoryFilter, setCategoryFilter] = useState("all")
  const [stockFilter, setStockFilter] = useState("all")
  const [search, setSearch] = useState("")
  const [sortBy, setSortBy] = useState("name") // "name" o "stock"
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

  const filteredInputs = (inputs) => {
  let filtered = inputs.filter(input => {
    const searchLower = search.trim().toLowerCase()

    // Filtro de búsqueda (nombre o marca)
    const matchesSearch =
      input.name?.toLowerCase().includes(searchLower) ||
      input.brand?.toLowerCase().includes(searchLower)

    // Filtro de categoría
    const matchesCategory =
      categoryFilter === "all" ||
      input?.category === normalize(categoryFilter)

    // Filtro de estado de stock
    const matchesStockStatus =
      stockFilter === "all" ||
      input.estadoStock === stockFilter

    return matchesSearch && matchesCategory && matchesStockStatus
  })

  // Aplicar ordenamiento
  filtered.sort((a, b) => {
    let aValue, bValue

    if (sortBy === "name") {
      aValue = a.name?.toLowerCase() || ""
      bValue = b.name?.toLowerCase() || ""
    } else if (sortBy === "stock") {
      aValue = a.stockTotal || 0
      bValue = b.stockTotal || 0
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
    filteredInputs,
  }
}