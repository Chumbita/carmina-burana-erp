import { useState } from "react";

export function useProductionFilters() {
  // Estados iniciales de control de la FilterBar
  const [sortBy, setSortBy] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");

  const handleSetSortBy = (value) => {
    setSortBy(value);
  };

  const handleSetSortOrder = (value) => {
    setSortOrder(value);
  };

  // Función procesadora idéntica a la que usas en insumos
  const filteredProductions = (productions) => {
    if (!productions) return [];

    const filtered = [...productions];

    // Aplicar ordenamiento por fecha cronológica
    if (sortBy === "schedule_date") {
      filtered.sort((a, b) => {
        const dateA = a.schedule_date ? new Date(a.schedule_date).getTime() : 0;
        const dateB = b.schedule_date ? new Date(b.schedule_date).getTime() : 0;

        return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
      });
    }

    return filtered;
  };

  return {
    sortBy,
    sortOrder,
    setSortBy: handleSetSortBy,
    setSortOrder: handleSetSortOrder,
    filteredProductions,
  };
}
