import { DataTable } from "@/components/shared/DataTable";
import { Badge } from "@/components/ui/Badge";
import { useNavigate } from "react-router-dom";

export function ProductionTable({ productions }) {
  const navigate = useNavigate();

  const handleRowClick = (row) => {
    navigate(`/produccion/cocciones/${row.id}`);
  };

  const columns = [
    { header: "Nro", accessor: "row_number" },
    { header: "Producto", accessor: "item_id" },
    { header: "Receta", accessor: "bom_id" },
    { header: "Cantidad", accessor: "planned_quantity" },
    { header: "Fecha planeada", accessor: "schedule_date" },
    {
      header: "Estado",
      accessor: "status",
      render: (value) => <Badge variant="outline">{value}</Badge>,
    },
  ];
  const formattedProductions = productions?.map((production, index) => ({
    ...production,
    row_number: index + 1,
  })) || [];

  return (
    <DataTable
      columns={columns}
      data={formattedProductions}
      onRowClick={handleRowClick}
      emptyMessage="No hay órdenes de producción."
    />
  );
}

export default ProductionTable;
