import { Input } from '@/components/ui/Input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { Search, Calendar } from 'lucide-react'

/**
 * SupplyEntryFilters - Component for filtering supply entries
 * @param {Object} props - Component props
 * @param {Object} props.filters - Current filter values
 * @param {Function} props.updateFilter - Function to update filters
 * @param {Function} props.clearFilters - Function to clear all filters
 * @param {Array} props.uniqueSuppliers - List of unique suppliers
 */
export function SupplyEntryFilters({ filters, updateFilter, clearFilters, uniqueSuppliers }) {
  return (
    <div className="flex gap-3 flex-1 flex-wrap">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
        <Input
          placeholder="Buscar por ID o proveedor..."
          value={filters.searchTerm}
          onChange={(e) => updateFilter('searchTerm', e.target.value)}
          className="max-w-sm border-none bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 pl-10"
        />
      </div>

      <div className="relative">
        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
        <Input
          type="date"
          placeholder="Desde"
          value={filters.dateFrom}
          onChange={(e) => updateFilter('dateFrom', e.target.value)}
          className="w-40 border-none bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 pl-10"
        />
      </div>

      <div className="relative">
        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
        <Input
          type="date"
          placeholder="Hasta"
          value={filters.dateTo}
          onChange={(e) => updateFilter('dateTo', e.target.value)}
          className="w-40 border-none bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 pl-10"
        />
      </div>

      <Select value={filters.selectedSupplier} onValueChange={(value) => updateFilter('selectedSupplier', value)}>
        <SelectTrigger className="w-48 cursor-pointer bg-neutral-100 border-none text-muted-foreground">
          <SelectValue placeholder="Proveedor" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos los proveedores</SelectItem>
          {uniqueSuppliers.map((supplier) => (
            <SelectItem key={supplier} value={supplier}>
              {supplier}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Clear filters button */}
      {(filters.dateFrom || filters.dateTo || filters.selectedSupplier !== 'all' || filters.searchTerm) && (
        <Button
          variant="outline"
          size="sm"
          onClick={clearFilters}
          className="cursor-pointer"
        >
          Limpiar filtros
        </Button>
      )}
    </div>
  )
}
