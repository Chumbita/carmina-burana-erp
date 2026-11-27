import { useNavigate } from 'react-router-dom'
import { Badge } from '@/components/ui/Badge'
import { DataTable } from '@/components/shared/DataTable'
import { formatCurrency } from '@/lib/utils/formatters'

import { isCancelledStatus, mapSupplyEntryRows } from '../dto/supplyEntry.dto'
import { formatEntryDateTime } from '../utils/supplyEntryFormatters'

/**
 * SupplyEntryTable - Component for displaying supply entries table
 * @param {Object} props - Component props
 * @param {Array} props.entries - Array of supply entries
 * @param {boolean} props.loading - Loading state
 */
export function SupplyEntryTable({ entries, hasRecords, loading, page = 1, pageSize = 20 }) {
  const navigate = useNavigate()

  const handleRowClick = (entry) => {
    navigate(`/inventario/ingreso-insumos/${entry.id}`)
  }

  const tableData = mapSupplyEntryRows(entries, page, pageSize)

  const columns = [
    {
      header: 'Nro',
      accessor: 'row_number',
    },
    {
      header: 'Código',
      accessor: 'document_number',
      render: (value, entry) => value || `REC-${entry.id}`,
    },
    {
      header: 'Fecha',
      accessor: 'entry_date',
      render: formatEntryDateTime,
    },
    {
      header: 'Proveedor',
      accessor: 'supplier',
      render: (value) => value?.name || 'Sin proveedor',
    },
    {
      header: 'Cantidad',
      accessor: 'items_count',
      render: (value) => `${value || 0} artículos`,
    },
    {
      header: 'Costo Total',
      accessor: 'total_cost',
      render: (value) => formatCurrency(value),
    },
    {
      header: 'Estado',
      accessor: 'status',
      render: (value) => (
        <Badge
          variant="outline"
          className={isCancelledStatus(value)
            ? 'bg-red-500/10 text-red-600 border-red-500/30'
            : 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30'}
        >
          {isCancelledStatus(value) ? 'Anulada' : 'Activa'}
        </Badge>
      ),
    },
  ]

  if (loading && entries.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-neutral-500">Cargando...</div>
      </div>
    )
  }

  return (
    <div className={`overflow-x-auto transition-opacity ${loading ? 'opacity-60 pointer-events-none' : ''}`}>
      <DataTable
        columns={columns}
        data={tableData}
        emptyMessage="No hay abastecimientos registrados"
        noResultsMessage="No se encontraron abastecimientos con los filtros aplicados"
        hasRecords={hasRecords}
        onRowClick={handleRowClick}
      />
    </div>
  )
}
