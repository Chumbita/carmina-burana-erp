import { useMemo, useState } from "react";

const initialCookings = [
  {
    id: 1,
    name: "Cocción A",
    recipe: "Golden Ale",
    batch: "L-001",
    status: "En proceso",
    date: "2026-06-29",
  },
  {
    id: 2,
    name: "Cocción B",
    recipe: "Porter",
    batch: "L-002",
    status: "Finalizada",
    date: "2026-06-28",
  },
  {
    id: 3,
    name: "Cocción C",
    recipe: "Stout",
    batch: "L-003",
    status: "Programada",
    date: "2026-06-30",
  },
];

export function useCookingsPage() {
  const [cookings, setCookings] = useState(initialCookings);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [openModal, setOpenModal] = useState(false);

  const statusOptions = [
    { label: "Todos", value: "all" },
    { label: "Programada", value: "Programada" },
    { label: "En proceso", value: "En proceso" },
    { label: "Finalizada", value: "Finalizada" },
  ];

  const filteredCookings = useMemo(() => {
    const normalizedSearch = search.toLowerCase().trim();

    const filtered = cookings.filter((cooking) => {
      const matchesSearch =
        !normalizedSearch ||
        [cooking.name, cooking.recipe, cooking.batch, cooking.status]
          .join(" ")
          .toLowerCase()
          .includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "all" || cooking.status === statusFilter;

      return matchesSearch && matchesStatus;
    });

    filtered.sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];

      if (sortBy === "date") {
        return sortOrder === "asc"
          ? new Date(aValue) - new Date(bValue)
          : new Date(bValue) - new Date(aValue);
      }

      const comparison = String(aValue).localeCompare(String(bValue));
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [cookings, search, statusFilter, sortBy, sortOrder]);

  const totalCount = filteredCookings.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCookings = filteredCookings.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const handleCreateCooking = (formData) => {
    const newCooking = {
      id: Date.now(),
      name: formData.name,
      recipe: formData.recipe,
      batch: formData.batch,
      status: formData.status,
      date: formData.date,
    };

    setCookings((prev) => [newCooking, ...prev]);
    setOpenModal(false);
    setCurrentPage(1);
  };

  return {
    cookings: paginatedCookings,
    loading: false,
    search,
    statusFilter,
    sortBy,
    sortOrder,
    currentPage,
    itemsPerPage,
    totalCount,
    totalPages,
    statusOptions,
    openModal,
    setSearch,
    setStatusFilter,
    setSortBy,
    setSortOrder,
    setCurrentPage,
    setOpenModal,
    handleCreateCooking,
  };
}
