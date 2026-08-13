import { useNavigate } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { DataTable } from '@/components/shared/DataTable'
import { formatCurrency } from '@/lib/utils/formatters'

/**
 * SupplyEntryTable - Component for displaying supply entries table
 * @param {Object} props - Component props
 * @param {Array} props.entries - Array of supply entries
 * @param {boolean} props.loading - Loading state
 */
export function SupplyEntryTable({ entries, loading }) {
  const navigate = useNavigate()

  const handleRowClick = (entry) => {
    navigate(`/inventario/ingreso-insumos/${entry.id}`)
  }

  const tableData = entries.map((entry, index) => ({
    ...entry,
    row_number: index + 1,
  }))

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
      render: (value) => value ? new Date(value).toLocaleString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23',
      }) : '—',
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
          className={value === 'CANCELED'
            ? 'bg-red-500/10 text-red-600 border-red-500/30'
            : 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30'}
        >
          {value === 'CANCELED' ? 'Anulada' : 'Activa'}
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

  if (!loading && entries.length === 0) {
    return (
      <Card>
        <div className="text-center py-8">
          <p className="text-neutral-500">No se encontraron registros</p>
        </div>
      </Card>
    )
  }

  return (
    <div className={`overflow-x-auto transition-opacity ${loading ? 'opacity-60 pointer-events-none' : ''}`}>
      <DataTable
        columns={columns}
        data={tableData}
        onRowClick={handleRowClick}
      />
    </div>
  )
}
