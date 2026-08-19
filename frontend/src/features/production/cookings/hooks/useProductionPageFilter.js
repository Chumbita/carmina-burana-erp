import { useState } from "react";

export function useProductionFilters() {
  // Opciones para el selector de estados
  const statusOptions = [
    { value: "ALL", label: "Todos los estados" },
    { value: "DONE", label: "Completada" },
    { value: "CANCELLED", label: "Cancelada" },
    { value: "DISCARDED", label: "Descartada" },
  ];

  // Estados iniciales de control de la FilterBar
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [search, setSearch] = useState("");

  const handleSetStatusFilter = (value) => {
    setStatusFilter(value);
  };

  const handleSetSortBy = (value) => {
    setSortBy(value);
  };

  const handleSetSortOrder = (value) => {
    setSortOrder(value);
  };

  const handleSetSearch = (value) => {
    setSearch(value);
  };

  // Función procesadora idéntica a la que usas en insumos
  const filteredProductions = (productions) => {
    if (!productions) return [];

    // 0. Filtrar por búsqueda
    let filtered = productions.filter((order) => {
      if (!search.trim()) return true;
      const term = search.trim().toLowerCase();
      return (order.item_name || "").toLowerCase().includes(term);
    });

    // 1. Filtrar por estado
    filtered = filtered.filter((order) => {
      return statusFilter === "ALL" || order.status === statusFilter;
    });

    // 2. Aplicar ordenamiento por fecha cronológica
    const sortByDate = (key) => (a, b) => {
      const hasA = a[key];
      const hasB = b[key];
      if (hasA && !hasB) return -1;
      if (!hasA && hasB) return 1;
      if (!hasA && !hasB) return 0;
      const dateA = new Date(a[key]).getTime();
      const dateB = new Date(b[key]).getTime();
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    };

    if (sortBy === "schedule_date") {
      filtered.sort(sortByDate("schedule_date"));
    }

    if (sortBy === "completed_at") {
      filtered.sort(sortByDate("completed_at"));
    }

    return filtered;
  };

  return {
    statusOptions,
    statusFilter,
    sortBy,
    sortOrder,
    search,
    setStatusFilter: handleSetStatusFilter,
    setSortBy: handleSetSortBy,
    setSortOrder: handleSetSortOrder,
    setSearch: handleSetSearch,
    filteredProductions,
  };
}
