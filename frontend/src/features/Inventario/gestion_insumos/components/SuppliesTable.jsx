import { DataTable } from "@/components/shared/DataTable"
import { Badge } from "@/components/ui/Badge"
import { useNavigate } from "react-router-dom"
import { formatDecimal } from "@/lib/utils/formatters"

import { estadoStyles } from "../utils/stockStyles"
import {
  getSupplyDetailRoute,
  isPackagingItemType,
  resolveSupplyCategory,
} from "../dto/supply.dto"

export function SuppliesTable({ insumos, loading, page = 1, pageSize = 20, hasRecords }) {
  const navigate = useNavigate()

  const handleRowClick = (insumo) => {
    navigate(getSupplyDetailRoute(insumo))
  }

  if (loading && !insumos?.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-neutral-500">Cargando...</div>
      </div>
    )
  }

  const tableHeaders = [
    {
      header: "Nro",
      accessor: "id",
      render: (_value, _row, index) => (page - 1) * pageSize + index + 1,
    },
    { header: "Nombre", accessor: "name" },
    { header: "Marca", accessor: "brand_name" },
    {
      header: "Categoria",
      accessor: "category",
      render: (_value, insumo) => resolveSupplyCategory(insumo),
    },
    {
      header: "Tipo",
      accessor: "item_type",
      render: (value) => (isPackagingItemType(value) ? "Envase" : "Producción"),
    },
    {
      header: "Stock",
      accessor: "stock_total",
      render: (value, insumo) => (
        <div className="w-8">
          {formatDecimal(value)} {insumo.base_uom_symbol}
        </div>
      ),
    },
    {
      header: "Estado",
      accessor: "estado_stock",
      render: (value) => (
        <Badge variant="outline" className={`${estadoStyles[value]} capitalize`}>
          {value}
        </Badge>
      ),
    },
  ]

  return (
    <DataTable
      columns={tableHeaders}
      data={insumos}
      emptyMessage="No hay insumos registrados"
      noResultsMessage="No se encontraron insumos con los filtros aplicados"
      hasRecords={hasRecords}
      onRowClick={handleRowClick}
    />
  )
}
