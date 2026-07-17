import { useMemo, useState } from "react"
import { SUPPLY_CATEGORIES } from "../schemas/supply.schema"

function getCategory(supply) {
  return supply?.category ?? supply?.supply_category ?? supply?.packaging_type ?? ""
}

const normalize = (value) => value?.trim().toLowerCase()

export function useSupplyFilters(supplies = []) {
  const categories = useMemo(() => {
    const values = new Set(SUPPLY_CATEGORIES)

    supplies.forEach((supply) => {
      const category = getCategory(supply)
      if (category) values.add(category)
    })

    return [
      { value: "all", label: "Categorías..." },
      ...Array.from(values).map((category) => ({ value: category, label: category })),
    ]
  }, [supplies])

  const stockStatuses = [
    { value: "all", label: "Estado de stock..." },
    { value: "critico", label: "Crítico" },
    { value: "bajo", label: "Bajo" },
    { value: "optimo", label: "Normal" },
  ]

  const itemTypes = [
    { value: "all", label: "Tipo..." },
    { value: "SUPPLY", label: "Producción" },
    { value: "PACKAGING_SUPPLY", label: "Envase" },
  ]

  const [categoryFilter, setCategoryFilter] = useState("all")
  const [itemTypeFilter, setItemTypeFilter] = useState("all")
  const [stockFilter, setStockFilter] = useState("all")
  const [search, setSearch] = useState("")
  const [sortBy, setSortBy] = useState("id")
  const [sortOrder, setSortOrder] = useState("asc")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20

  const resetPage = () => setCurrentPage(1)

  const withPageReset = (setter) => (value) => {
    setter(value)
    resetPage()
  }

  const filteredSupplies = (items) => {
    const filtered = items.filter((supply) => {
      const searchLower = search.trim().toLowerCase()

      const matchesSearch =
        supply.name?.toLowerCase().includes(searchLower) ||
        supply.brand_name?.toLowerCase().includes(searchLower)

      const matchesCategory =
        categoryFilter === "all" ||
        normalize(getCategory(supply)) === normalize(categoryFilter)

      const matchesItemType =
        itemTypeFilter === "all" ||
        normalize(supply.item_type) === normalize(itemTypeFilter)

      const matchesStockStatus =
        stockFilter === "all" ||
        supply.estado_stock === stockFilter

      return matchesSearch && matchesCategory && matchesItemType && matchesStockStatus
    })

    filtered.sort((a, b) => {
      let aValue
      let bValue

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
      }

      return aValue < bValue ? 1 : aValue > bValue ? -1 : 0
    })

    const startIndex = (currentPage - 1) * itemsPerPage
    const paginatedResults = filtered.slice(startIndex, startIndex + itemsPerPage)

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
    setSearch: withPageReset(setSearch),
    setCategoryFilter: withPageReset(setCategoryFilter),
    setItemTypeFilter: withPageReset(setItemTypeFilter),
    setStockFilter: withPageReset(setStockFilter),
    setSortBy: withPageReset(setSortBy),
    setSortOrder: withPageReset(setSortOrder),
    setCurrentPage,
    filteredSupplies,
  }
}
