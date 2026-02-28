
// /hooks/useFilter.js
import { useState } from "react"

export function useInputFilters() {
  const categorias = [
    { value: "todas", label: "Categorías..." },
    { value: "Lúpulo", label: "Lúpulo" },
    { value: "Malta", label: "Malta" },
    { value: "Envases", label: "Envases" },
  ]

    const [categoriaFilter, setCategoriaFilter] = useState("todas")
    const [search, setSearch] = useState("")

    const filteredInputs = (inputs) => inputs.filter(input => {
    const searchLower = search.trim().toLowerCase()

    // Filtro de búsqueda (nombre o marca)
    const matchesSearch =
      input.name?.toLowerCase().includes(searchLower) ||
      input.brand?.toLowerCase().includes(searchLower)

    // Filtro de categoría
    const matchesCategoria =
      categoriaFilter === "todas" ||
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