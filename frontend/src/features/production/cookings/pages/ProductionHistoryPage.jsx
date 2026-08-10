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
    setStatusFilter,
    setSortBy,
    setSortOrder,
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
          search={""}
          searchPlaceholder="Buscar..."
          onSearchChange={() => {}}
          filters={[
            {
              key: "status",
              placeholder: "Filtrar por estado",
              value: statusFilter,
              onChange: (value) => setStatusFilter(value),
              options: statusOptions,
            },
          ]}
          sortFields={[{ key: "schedule_date", label: "Fecha Programada" }]}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortByChange={setSortBy}
          onSortOrderChange={setSortOrder}
          hasActiveFilters={statusFilter !== "ALL" || sortBy !== ""}
          onClearFilters={() => {
            setStatusFilter("ALL");
            setSortBy("");
            setSortOrder("asc");
          }}
        />
      </header>

      <div>
        {loading ? (
          <div>Cargando...</div>
        ) : (
          <ProductionHistoryTable productions={displayData} onDiscard={handleDiscard} />
        )}
      </div>
    </div>
  );
}
