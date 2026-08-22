import { FilterBar } from "@/components/shared/FilterBar";
import { useProductionHistory } from "../hooks/useProductionHistory";
import { useProductionFilters } from "../hooks/useProductionPageFilter";
import { ProductionHistoryTable } from "../components/ProductionHistoryTable";

export default function ProductionHistoryPage() {
  const { productions, loading, discardProduction } = useProductionHistory();
  const {
    statusOptions,
    statusFilter,
    sortBy,
    sortOrder,
    search,
    setStatusFilter,
    setSortBy,
    setSortOrder,
    setSearch,
    filteredProductions,
  } = useProductionFilters();

  const displayData = filteredProductions(productions);

  async function handleDiscard(row, description) {
    await discardProduction(row.id, {
      description: description?.trim() || undefined,
    });
  }

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between gap-4">
        <FilterBar
          search={search}
          searchPlaceholder="Buscar producto..."
          onSearchChange={setSearch}
          filters={[
            {
              key: "status",
              placeholder: "Filtrar por estado",
              value: statusFilter,
              onChange: (value) => setStatusFilter(value),
              options: statusOptions,
            },
          ]}
          sortFields={[{ key: "completed_at", label: "Fecha completada" }]}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortByChange={setSortBy}
          onSortOrderChange={setSortOrder}
          hasActiveFilters={statusFilter !== "ALL" || sortBy !== "" || search !== ""}
          onClearFilters={() => {
            setStatusFilter("ALL");
            setSortBy("");
            setSortOrder("asc");
            setSearch("");
          }}
        />
      </header>

      <div>
        {loading ? (
          <div>Cargando...</div>
        ) : (
          <ProductionHistoryTable
            productions={displayData}
            hasRecords={productions.length > 0}
            onDiscard={handleDiscard}
          />
        )}
      </div>
    </div>
  );
}
