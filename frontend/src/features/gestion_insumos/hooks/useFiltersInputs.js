
// /hooks/useFilter.js
import { useState } from "react"

export function useInputFilters() {
  const categories = [
    { value: "all", label: "Categorías..." },
    { value: "Lúpulo", label: "Lúpulo" },
    { value: "Malta", label: "Malta" },
    { value: "Envases", label: "Envases" },
  ]

  const [categoryFilter, setCategoryFilter] = useState("all")
  const [search, setSearch] = useState("")

  const normalize = (str) => str?.trim().toLowerCase()

  const filteredInputs = (inputs) => inputs.filter(input => {
    const searchLower = search.trim().toLowerCase()

    // Filtro de búsqueda (nombre o marca)
    const matchesSearch =
      input.name?.toLowerCase().includes(searchLower) ||
      input.brand?.toLowerCase().includes(searchLower)

    console.log(categoryFilter);

    // Filtro de categoría
    const matchesCategory =
      categoryFilter === "all" ||
      input?.category === normalize(categoryFilter)

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