
// /hooks/useFilter.js
import { useState } from "react"

export function useInputFilters() {
  const categorias = [
    { value: "all", label: "Categorías..." },
    { value: "hop", label: "Lúpulo" },
    { value: "malt", label: "Malta" },
    { value: "packaging", label: "Envases" },
  ]

    const [categoriaFilter, setCategoriaFilter] = useState("all")
    const [search, setSearch] = useState("")

    const filteredInputs = (inputs) => inputs.filter(input => {
    const searchLower = search.trim().toLowerCase()

    // Filtro de búsqueda (nombre o marca)
    const matchesSearch =
      input.name?.toLowerCase().includes(searchLower) ||
      input.brand?.toLowerCase().includes(searchLower)

    // Filtro de categoría
    const matchesCategoria =
      categoriaFilter === "all" ||
      input.category === categoriaFilter

    return matchesSearch && matchesCategoria
  })


return {
  categorias,
  search,          
  categoriaFilter, 
  setSearch,
  setCategoriaFilter,
  filteredInputs,
}
}