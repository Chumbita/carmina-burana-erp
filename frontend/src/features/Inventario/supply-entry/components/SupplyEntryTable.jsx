import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Eye } from 'lucide-react'

/**
 * SupplyEntryTable - Component for displaying supply entries table
 * @param {Object} props - Component props
 * @param {Array} props.entries - Array of supply entries
 * @param {boolean} props.loading - Loading state
 */
export function SupplyEntryTable({ entries, loading }) {
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
    <Card>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-neutral-50 border-b border-neutral-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Nº
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Fecha
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Proveedor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Cantidad
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Costo Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-neutral-200">
            {entries.map((entry) => (
              <tr
                key={entry.id}
                className="hover:bg-neutral-50 transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">
                  <Link
                    to={`/inventario/ingreso-insumos/${entry.id}`}
                    className="hover:underline"
                  >
                    {entry.document_number || `REC-${entry.id}`}
                  </Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">
                  {new Date(entry.entry_date).toLocaleDateString('es-AR')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">
                  {entry.supplier?.name || 'Sin proveedor'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">
                  {entry.items_count || 0} artículos
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">
                  ${Number(entry.total_cost || 0).toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge variant={entry.status === 'CANCELED' ? 'destructive' : 'default'}>
                    {entry.status === 'CANCELED' ? 'Anulada' : 'Activa'}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">
                  <Link
                    to={`/inventario/ingreso-insumos/${entry.id}`}
                    className="inline-flex"
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className="cursor-pointer"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
