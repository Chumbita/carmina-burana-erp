import { useNavigate } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { DataTable } from '@/components/shared/DataTable'

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
      header: 'Nº',
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
      render: (value) => new Date(value).toLocaleDateString('es-AR'),
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
      render: (value) => `$${Number(value || 0).toFixed(2)}`,
    },
    {
      header: 'Estado',
      accessor: 'status',
      render: (value) => (
        <Badge variant={value === 'CANCELED' ? 'destructive' : 'default'}>
          {value === 'CANCELED' ? 'Anulada' : 'Activa'}
        </Badge>
      ),
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-neutral-500">Cargando...</div>
      </div>
    )
  }

  if (entries.length === 0) {
    return (
      <Card>
        <div className="text-center py-8">
          <p className="text-neutral-500">No se encontraron registros</p>
        </div>
      </Card>
    )
  }

  return (
    <div className="overflow-x-auto">
      <DataTable
        columns={columns}
        data={tableData}
        onRowClick={handleRowClick}
      />
    </div>
  )
}
