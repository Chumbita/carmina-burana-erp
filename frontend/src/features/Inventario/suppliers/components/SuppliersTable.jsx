import { Link, useNavigate } from 'react-router-dom'

import { DataTable } from '@/components/shared/DataTable'
import { Card } from '@/components/ui/Card'

export function SuppliersTable({ suppliers, loading }) {
  const navigate = useNavigate()

  const columns = [
    { header: 'Nro', accessor: 'id' },
    {
      header: 'Nombre',
      accessor: 'name',
      render: (value, supplier) => (
        <Link className="font-medium hover:underline" to={`/inventario/proveedores/${supplier.id}`} onClick={(event) => event.stopPropagation()}>
          {value}
        </Link>
      ),
    },
    { header: 'Email', accessor: 'email', render: (value) => value || '-' },
    { header: 'Teléfono', accessor: 'phone', render: (value) => value || '-' },
    { header: 'Dirección', accessor: 'address', render: (value) => <span className="block max-w-72 truncate">{value || '-'}</span> },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-neutral-500">Cargando...</div>
      </div>
    )
  }

  if (!suppliers.length) {
    return (
      <Card>
        <div className="text-center py-8">
          <p className="text-neutral-500">No se encontraron proveedores</p>
        </div>
      </Card>
    )
  }

  return (
    <div className="overflow-x-auto">
      <DataTable
        columns={columns}
        data={suppliers}
        onRowClick={(supplier) => navigate(`/inventario/proveedores/${supplier.id}`)}
      />
    </div>
  )
}
