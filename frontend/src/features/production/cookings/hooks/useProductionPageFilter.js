import { useState } from "react";

export function useProductionFilters() {
  // Opciones para el selector de estados
  const statusOptions = [
    { value: "ALL", label: "Todos los estados" },
    { value: "PLANNED", label: "Planeada" },
    { value: "RELEASED", label: "Liberada" },
    { value: "IN_PROGRESS", label: "En Proceso" },
  ];

  // Estados iniciales de control de la FilterBar
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");

  const handleSetStatusFilter = (value) => {
    setStatusFilter(value);
  };

  const handleSetSortBy = (value) => {
    setSortBy(value);
  };

  const handleSetSortOrder = (value) => {
    setSortOrder(value);
  };

  // Función procesadora idéntica a la que usas en insumos
  const filteredProductions = (productions) => {
    if (!productions) return [];

    // 1. Filtrar por estado
    let filtered = productions.filter((order) => {
      return statusFilter === "ALL" || order.status === statusFilter;
    });

    // 2. Aplicar ordenamiento por fecha cronológica
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
    statusOptions,
    statusFilter,
    sortBy,
    sortOrder,
    setStatusFilter: handleSetStatusFilter,
    setSortBy: handleSetSortBy,
    setSortOrder: handleSetSortOrder,
    filteredProductions,
  };
}
