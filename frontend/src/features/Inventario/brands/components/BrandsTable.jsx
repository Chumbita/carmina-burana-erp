import { Link, useNavigate } from 'react-router-dom'

import { DataTable } from '@/components/shared/DataTable'
import { Card } from '@/components/ui/Card'

export function BrandsTable({ brands, loading }) {
  const navigate = useNavigate()

  const columns = [
    { header: 'N°', accessor: 'row_number', render: (_value, _brand, rowIndex) => rowIndex + 1 },
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

  if (!brands.length) {
    return (
      <Card>
        <div className="py-8 text-center">
          <p className="text-neutral-500">No se encontraron marcas</p>
        </div>
      </Card>
    )
  }

  return (
    <div className="overflow-x-auto">
      <DataTable
        columns={columns}
        data={brands}
        onRowClick={(brand) => navigate(`/inventario/marcas/${brand.id}`)}
      />
    </div>
  )
}
