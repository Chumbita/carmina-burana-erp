import { Link, useNavigate } from 'react-router-dom'

import { DataTable } from '@/components/shared/DataTable'

export function BrandsTable({ brands, hasRecords, loading }) {
  const navigate = useNavigate()

  const columns = [
    { header: 'Nro', accessor: 'row_number', render: (_value, _brand, rowIndex) => rowIndex + 1 },
    {
      header: 'Nombre',
      accessor: 'name',
      render: (value, brand) => (
        <Link
          className="font-medium"
          to={`/inventario/marcas/${brand.id}`}
          onClick={(event) => event.stopPropagation()}
        >
          {value}
        </Link>
      ),
    },
    { header: 'Estado', accessor: 'is_active', render: (value) => (value ? 'Activo' : 'Inactivo') },
  ]

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-neutral-500">Cargando...</div>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <DataTable
        columns={columns}
        data={brands}
        emptyMessage="No hay marcas registradas"
        noResultsMessage="No se encontraron marcas con los filtros aplicados"
        hasRecords={hasRecords}
        onRowClick={(brand) => navigate(`/inventario/marcas/${brand.id}`)}
      />
    </div>
  )
}
