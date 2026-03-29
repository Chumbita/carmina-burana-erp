import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import { Pagination } from "../../gestion_insumos/components/Pagination"

import { Search, Calendar, Filter, Eye, Download, ArrowLeft, Package } from 'lucide-react'

/**
 * SupplyEntryHistory - Component for supply entry history view
 * @param {Object} props - Component props
 * @param {Object} props.historyHook - History hook from useSupplyEntryHistory
 * @param {Function} props.onNewEntry - Callback for new entry
 * @param {Function} props.onRowClick - Callback for row click
 */
export function SupplyEntryHistory({ historyHook, onNewEntry, onRowClick }) {
  const {
    loading,
    error,
    currentPage,
    filters,
    filteredEntries,
    paginatedEntries,
    totalPages,
    uniqueSuppliers,
    setCurrentPage,
    updateFilter,
    clearFilters,
  } = historyHook

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="border-red-200 bg-red-50">
          <div className="p-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </Card>
      </div>
    )
  }

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
