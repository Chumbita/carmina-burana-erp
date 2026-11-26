import { FilterBar } from "@/components/shared/FilterBar"
import { Button } from "@/components/ui/Button"
import { Plus } from "lucide-react"

/**
 * Barra de búsqueda, filtros, orden y acción de alta de la grilla de insumos.
 */
export function SuppliesToolbar({
  filters,
  hasActiveFilters,
  onChangeSearch,
  onChangeCategory,
  onChangeItemType,
  onChangeStock,
  onChangeSortBy,
  onChangeSortOrder,
  onClearFilters,
  onCreate,
}) {
  return (
    <header className="flex items-center justify-between gap-4">
      <FilterBar
        search={filters.search}
        searchPlaceholder="Buscar por nombre o marca..."
        onSearchChange={onChangeSearch}
        filters={[
          {
            key: "category",
            placeholder: "Categoría",
            value: filters.category,
            options: filters.categoryOptions,
            onChange: onChangeCategory,
          },
          {
            key: "itemType",
            placeholder: "Tipo",
            value: filters.itemType,
            options: filters.itemTypeOptions,
            onChange: onChangeItemType,
          },
          {
            key: "stock",
            placeholder: "Estado stock",
            value: filters.stock,
            options: filters.stockOptions,
            onChange: onChangeStock,
          },
        ]}
        sortFields={filters.sortFields}
        sortBy={filters.sortBy}
        sortOrder={filters.sortOrder}
        onSortByChange={onChangeSortBy}
        onSortOrderChange={onChangeSortOrder}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={onClearFilters}
      />
      <Button size="sm" className="cursor-pointer" onClick={onCreate}>
        <Plus />
        Agregar insumo
      </Button>
    </header>
  )
}
