import { DataTable } from "../../../../components/shared/DataTable";
import { Badge } from "@/components/ui/Badge";
import { estadoStyles } from "../utils/stockStyles";
import { useNavigate } from "react-router-dom";
import { formatDecimal } from "@/lib/utils/formatters";

export function SuppliesTable({ insumos, hasRecords }) {
  const navigate = useNavigate();

  const handleRowClick = (insumo) => {
    if (insumo.item_type?.toUpperCase() === "PACKAGING_SUPPLY") {
      navigate(`/inventario/insumos/envases/${insumo.id}`);
      return;
    }

    navigate(`/inventario/insumos/${insumo.id}`);
  };

  const tableHeaders = [
    { header: "Nro", accessor: "id" },
    { header: "Nombre", accessor: "name" },
    { header: "Marca", accessor: "brand_name" },
    {
      header: "Categoria",
      accessor: "category",
      render: (value, insumo) => value ?? insumo.supply_category ?? insumo.packaging_type ?? "-",
    },
    {
      header: "Tipo",
      accessor: "item_type",
      render: (value) => value?.toUpperCase() === "PACKAGING_SUPPLY" ? "Envase" : "Producción",
    },
    { header: "Stock", accessor: "stock_total" ,
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
  ];

  return (
    <DataTable
      columns={tableHeaders}
      data={insumos}
      emptyMessage="No hay insumos registrados"
      noResultsMessage="No se encontraron insumos con los filtros aplicados"
      hasRecords={hasRecords}
      onRowClick={handleRowClick}
    />
  );
}
