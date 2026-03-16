
// /hooks/useFilter.js
import { useState } from "react"

export function useInputFilters() {
  const categories = [
    { value: "all", label: "Categorías..." },
    { value: "hop", label: "Lúpulo" },
    { value: "malt", label: "Malta" },
    { value: "packaging", label: "Envases" },
  ]

    const [categoryFilter, setCategoryFilter] = useState("all")
    const [search, setSearch] = useState("")

    const filteredInputs = (inputs) => inputs.filter(input => {
    const searchLower = search.trim().toLowerCase()

    // Filtro de búsqueda (nombre o marca)
    const matchesSearch =
      input.name?.toLowerCase().includes(searchLower) ||
      input.brand?.toLowerCase().includes(searchLower)

    // Filtro de categoría
    const matchesCategory =
      categoryFilter === "all" ||
      input.category === categoryFilter

    return matchesSearch && matchesCategory
  })


return {
  categories,
  search,          
  categoryFilter, 
  setSearch,
  setCategoryFilter,
  filteredInputs,
}
}