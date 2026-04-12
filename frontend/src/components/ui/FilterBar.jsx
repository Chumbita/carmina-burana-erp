import { Input } from "@/components/ui/Input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select"
import { Button } from "@/components/ui/Button"
import { X, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"

/**
 * @param {string} searchPlaceholder - Placeholder del input de búsqueda
 * @param {string} search - Valor actual del input
 * @param {function} onSearchChange - Callback al cambiar búsqueda
 *
 * @param {Array} filters - [{ key, placeholder, value, options: [{ label, value }], onChange }]
 * @param {string} filters[].key - Identificador único del filtro
 * @param {string} filters[].placeholder - Texto del Select vacío
 * @param {string} filters[].value - Valor seleccionado actualmente
 * @param {Array}  filters[].options - Opciones del Select
 * @param {function} filters[].onChange - Callback al cambiar
 *
 * @param {Array} sortFields - [{ key, label }]
 * @param {string} sortBy - Campo activo de ordenamiento
 * @param {string} sortOrder - "asc" | "desc"
 * @param {function} onSortByChange
 * @param {function} onSortOrderChange
 *
 * @param {function} onClearFilters - Callback para limpiar todo
 * @param {boolean} hasActiveFilters - Si hay filtros activos (para mostrar botón X)
 */
export function FilterBar({
  // Búsqueda
  search = "",
  searchPlaceholder = "Buscar...",
  onSearchChange,

  // Filtros dinámicos
  filters = [],

  // Ordenamiento
  sortFields = [],
  sortBy,
  sortOrder,
  onSortByChange,
  onSortOrderChange,

  // Limpiar
  hasActiveFilters = false,
  onClearFilters,
}) {
  const handleSortToggle = (field) => {
    if (sortBy === field) {
      onSortOrderChange(sortOrder === "asc" ? "desc" : "asc")
    } else {
      onSortByChange(field)
      onSortOrderChange("asc")
    }
  }

  const getSortIcon = (field) => {
    if (sortBy !== field) return <ArrowUpDown className="h-4 w-4" />
    return sortOrder === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
  }

  return (
    <div className="flex gap-3 flex-1">
      {/* Búsqueda */}
      {onSearchChange && (
        <Input
          placeholder={searchPlaceholder}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="max-w-sm border-none bg-neutral-100 focus-visible:outline-none focus-visible:ring-2"
        />
      )}

      {/* Selects dinámicos */}
      {filters.map((filter) => (
        <Select key={filter.key} value={filter.value} onValueChange={filter.onChange}>
          <SelectTrigger className="w-50 cursor-pointer bg-neutral-100 border-none text-muted-foreground">
            <SelectValue placeholder={filter.placeholder} />
          </SelectTrigger>
          <SelectContent>
            {filter.options.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ))}

      {/* Botones de ordenamiento dinámicos */}
      {sortFields.map((field) => (
        <Button
          key={field.key}
          variant="outline"
          size="sm"
          className="cursor-pointer bg-neutral-100 border-none"
          onClick={() => handleSortToggle(field.key)}
          title={`Ordenar por ${field.label} (${
            sortBy === field.key
              ? sortOrder === "asc" ? "ascendente" : "descendente"
              : "clic para ordenar"
          })`}
        >
          {field.label} {getSortIcon(field.key)}
        </Button>
      ))}

      {/* Limpiar filtros */}
      {hasActiveFilters && onClearFilters && (
        <Button
          variant="outline"
          size="icon"
          className="cursor-pointer"
          onClick={onClearFilters}
          title="Limpiar filtros"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}