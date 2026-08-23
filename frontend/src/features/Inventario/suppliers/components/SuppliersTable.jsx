import { Link, useNavigate } from 'react-router-dom'

import { DataTable } from '@/components/shared/DataTable'

export function SuppliersTable({ suppliers, hasRecords, loading }) {
  const navigate = useNavigate()

  const columns = [
    { header: 'Nro', accessor: 'id', render: (_value, _row, index) => index + 1 },
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

  return (
    <div className="overflow-x-auto">
      <DataTable
        columns={columns}
        data={suppliers}
        emptyMessage="No hay proveedores registrados"
        noResultsMessage="No se encontraron proveedores con los filtros aplicados"
        hasRecords={hasRecords}
        onRowClick={(supplier) => navigate(`/inventario/proveedores/${supplier.id}`)}
      />
    </div>
  )
}
